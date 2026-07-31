import uuid
import logging
from typing import Dict, Any, Optional
from app.core.config import settings
from app.agents.event_state import create_initial_state

logger = logging.getLogger("event_agent")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s - %(name)s: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)


class EventAgent:
    """
    Stateful LangGraph AI Agent entrypoint coordinating HITL pauses, thread state persistence,
    NLU intent classification, conditional routing, and structured response outputs.
    """

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.OPENAI_API_KEY
        self.is_valid_key = bool(self.api_key and "your_openai_api_key" not in self.api_key)

    async def extract_intent_and_params(self, message: str) -> Dict[str, Any]:
        """Utility NLU parser for intent and parameter extraction."""
        lower = message.lower().strip()
        intent = "SEARCH_EVENT"
        category = None
        city = None
        ticket_quantity = 1

        if "book" in lower or "confirm" in lower:
            intent = "BOOK_EVENT"
        elif "my booking" in lower or "upcoming" in lower:
            intent = "VIEW_BOOKINGS"
        elif "cancel" in lower:
            intent = "CANCEL_BOOKING"
        elif "calendar" in lower:
            intent = "ADD_TO_CALENDAR"

        if "music" in lower or "concert" in lower:
            category = "Music"
        elif "tech" in lower or "conference" in lower or "ai" in lower:
            category = "Tech Conference"
        elif "workshop" in lower or "ui/ux" in lower:
            category = "UI/UX Workshop"
        elif "ballet" in lower or "dance" in lower:
            category = "Ballet & Dance"

        if "bengaluru" in lower or "bangalore" in lower:
            city = "Bengaluru"
        elif "san francisco" in lower:
            city = "San Francisco"
        elif "austin" in lower:
            city = "Austin"
        elif "tokyo" in lower:
            city = "Tokyo"
        elif "london" in lower:
            city = "London"

        if "two" in lower or "2" in lower:
            ticket_quantity = 2

        return {
            "intent": intent,
            "category": category,
            "city": city,
            "ticketQuantity": ticket_quantity,
            "maxBudget": None
        }

    async def process_message(
        self,
        message: str,
        user_id: str = "user_default",
        conversation_id: Optional[str] = None,
        confirmation_action: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Executes LangGraph agent graph workflow for user chat turn, resuming existing thread
        session when conversation_id is provided.
        """
        conv_id = conversation_id or f"conv-{uuid.uuid4().hex[:8]}"
        action_str = f" [HITL Action: {confirmation_action}]" if confirmation_action else ""
        logger.info(f"Processing message via LangGraph for session '{conv_id}'{action_str}: '{message}'")

        try:
            from app.agents.event_graph import event_agent_graph

            initial_state = create_initial_state(
                user_message=message,
                user_id=user_id,
                conversation_id=conv_id,
                confirmation_action=confirmation_action
            )

            config = {"configurable": {"thread_id": conv_id}}
            final_state = await event_agent_graph.ainvoke(initial_state, config=config)

            is_pending = final_state.get("confirmation_status") == "PENDING"
            confirm_options = ["CONFIRM", "CANCEL", "CHANGE_EVENT"] if is_pending else []

            return {
                "message": final_state.get("final_response", ""),
                "event_recommendations": final_state.get("search_results", []),
                "agent_status": final_state.get("current_agent_step", "completed"),
                "agent_steps": [
                    {"id": "step-1", "step": f"LangGraph thread checkpoint: {conv_id}", "status": "completed"},
                    {"id": "step-2", "step": f"LangGraph node execution: {final_state.get('current_agent_step')}", "status": "completed"}
                ],
                "requires_confirmation": is_pending,
                "confirmation_options": confirm_options,
                "confirmation_data": {
                    "event_id": final_state["selected_event"].get("id") if final_state.get("selected_event") else None,
                    "event_title": final_state["selected_event"].get("event_name") or final_state["selected_event"].get("title") if final_state.get("selected_event") else None,
                    "ticket_quantity": final_state.get("ticket_quantity", 1)
                } if final_state.get("selected_event") else None,
                "conversation_id": conv_id
            }

        except Exception as err:
            logger.error(f"LangGraph execution exception: {err}. Falling back gracefully.")
            return {
                "message": f"Processed request: '{message}'.",
                "event_recommendations": [],
                "agent_status": "completed",
                "agent_steps": [{"id": "err-1", "step": "Handled agent execution safely", "status": "completed"}],
                "requires_confirmation": False,
                "confirmation_options": [],
                "confirmation_data": None,
                "conversation_id": conv_id
            }
