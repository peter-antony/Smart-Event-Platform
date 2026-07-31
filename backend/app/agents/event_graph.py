import logging
from typing import Dict, Any, Optional

from app.agents.event_state import EventAgentState, create_initial_state
from app.agents.event_nodes import (
    node_understand_request,
    node_identify_intent,
    node_search_events,
    node_show_event_options,
    node_wait_for_event_selection,
    node_ask_booking_confirmation,
    node_wait_for_confirmation,
    node_create_booking,
    node_add_to_calendar,
    node_send_notification,
    node_generate_final_response,
)
from app.agents.event_router import (
    route_after_intent,
    route_after_search,
    route_after_confirmation,
    route_after_booking,
)

logger = logging.getLogger("event_graph")


class LightweightLangGraphEngine:
    """
    Lightweight stateful 11-node graph execution engine providing full node routing,
    confirmation safety gates, and state persistence.
    """
    _checkpoints: Dict[str, EventAgentState] = {}

    async def ainvoke(self, input_state: EventAgentState, config: Optional[Dict[str, Any]] = None) -> EventAgentState:
        thread_id = config.get("configurable", {}).get("thread_id", "default_thread") if config else "default_thread"

        # Restore persistent state if existing and overlay turn inputs
        if thread_id in self._checkpoints:
            state = self._checkpoints[thread_id]
            state["user_message"] = input_state["user_message"]
            state["confirmation_action"] = input_state.get("confirmation_action")
        else:
            state = input_state

        # 1. understand_request
        state = await node_understand_request(state)

        # 2. identify_intent
        state = await node_identify_intent(state)

        # 3. Conditional Routing after intent
        next_route = route_after_intent(state)

        if next_route == "search_events":
            state = await node_search_events(state)
            state = await node_show_event_options(state)

        elif next_route == "ask_booking_confirmation":
            if state.get("confirmation_status") == "PENDING" or state.get("confirmation_action"):
                state = await node_wait_for_confirmation(state)
                if route_after_confirmation(state) == "create_booking":
                    state = await node_create_booking(state)
                    if route_after_booking(state) == "add_to_calendar":
                        state = await node_add_to_calendar(state)
                        state = await node_send_notification(state)
            else:
                state = await node_ask_booking_confirmation(state)

        elif next_route == "add_to_calendar":
            state = await node_add_to_calendar(state)
            state = await node_send_notification(state)

        # Final Node: generate_final_response
        state = await node_generate_final_response(state)

        # Save Persistent Checkpoint
        self._checkpoints[thread_id] = state
        return state


try:
    from langgraph.graph import StateGraph, END
    from langgraph.checkpoint.memory import MemorySaver

    def build_event_agent_graph():
        builder = StateGraph(EventAgentState)
        builder.add_node("understand_request", node_understand_request)
        builder.add_node("identify_intent", node_identify_intent)
        builder.add_node("search_events", node_search_events)
        builder.add_node("show_event_options", node_show_event_options)
        builder.add_node("wait_for_event_selection", node_wait_for_event_selection)
        builder.add_node("ask_booking_confirmation", node_ask_booking_confirmation)
        builder.add_node("wait_for_confirmation", node_wait_for_confirmation)
        builder.add_node("create_booking", node_create_booking)
        builder.add_node("add_to_calendar", node_add_to_calendar)
        builder.add_node("send_notification", node_send_notification)
        builder.add_node("generate_final_response", node_generate_final_response)

        builder.set_entry_point("understand_request")
        builder.add_edge("understand_request", "identify_intent")

        builder.add_conditional_edges(
            "identify_intent",
            route_after_intent,
            {
                "search_events": "search_events",
                "ask_booking_confirmation": "ask_booking_confirmation",
                "add_to_calendar": "add_to_calendar",
                "generate_final_response": "generate_final_response",
            }
        )

        builder.add_conditional_edges(
            "search_events",
            route_after_search,
            {
                "show_event_options": "show_event_options",
                "generate_final_response": "generate_final_response",
            }
        )

        builder.add_edge("show_event_options", "generate_final_response")
        builder.add_edge("ask_booking_confirmation", "wait_for_confirmation")

        builder.add_conditional_edges(
            "wait_for_confirmation",
            route_after_confirmation,
            {
                "create_booking": "create_booking",
                "generate_final_response": "generate_final_response",
            }
        )

        builder.add_conditional_edges(
            "create_booking",
            route_after_booking,
            {
                "add_to_calendar": "add_to_calendar",
                "generate_final_response": "generate_final_response",
            }
        )

        builder.add_edge("add_to_calendar", "send_notification")
        builder.add_edge("send_notification", "generate_final_response")
        builder.add_edge("generate_final_response", END)

        checkpointer = MemorySaver()
        return builder.compile(checkpointer=checkpointer)

    event_agent_graph = build_event_agent_graph()

except ImportError:
    logger.info("LangGraph package unconfigured in python env. Active graph engine fallback activated.")

    def build_event_agent_graph():
        return LightweightLangGraphEngine()

    event_agent_graph = LightweightLangGraphEngine()
