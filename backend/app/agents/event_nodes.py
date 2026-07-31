import logging
import re
from typing import Dict, Any
from app.agents.event_state import EventAgentState
from app.agents.event_agent import EventAgent
from app.core.socket_manager import SocketManager
from app.tools.event_tools import (
    tool_search_events,
    tool_get_event_details,
    tool_check_ticket_availability,
    tool_create_booking,
    tool_get_user_bookings,
    tool_cancel_booking,
    tool_add_event_to_calendar,
    tool_send_booking_notification,
)
from app.agents.prompts import (
    SHOW_EVENTS_PROMPT_TEMPLATE,
    ASK_CONFIRMATION_PROMPT_TEMPLATE,
    BOOKING_SUCCESS_TEMPLATE,
    NO_EVENTS_FOUND_TEMPLATE,
    UNAVAILABLE_TICKETS_TEMPLATE,
)

logger = logging.getLogger("event_nodes")
nlu_agent = EventAgent()


async def node_understand_request(state: EventAgentState) -> EventAgentState:
    """Node 1: Ingests user request message."""
    conv_id = state.get("conversation_id", "default_conv")
    await SocketManager.broadcast_agent_progress(
        step_name="UNDERSTANDING_REQUEST",
        conversation_id=conv_id,
        status="active",
        description=f"Parsing request: '{state['user_message']}'"
    )

    logger.info(f"[Node 1: understand_request] User Message: '{state['user_message']}'")
    state["current_agent_step"] = "UNDERSTANDING_REQUEST"
    state["error_information"] = None

    await SocketManager.broadcast_agent_progress(
        step_name="UNDERSTANDING_REQUEST",
        conversation_id=conv_id,
        status="completed",
        description="Parsed request message"
    )
    return state


async def node_identify_intent(state: EventAgentState) -> EventAgentState:
    """Node 2: NLU Intent & Criteria Extraction."""
    conv_id = state.get("conversation_id", "default_conv")
    await SocketManager.broadcast_agent_progress(
        step_name="FILTERING_EVENTS",
        conversation_id=conv_id,
        status="active",
        description="Extracting intent & parameters"
    )

    if state.get("confirmation_action"):
        action = state["confirmation_action"].upper()
        logger.info(f"[Node 2: identify_intent] Explicit HITL Action received: {action}")
        if action in ["CONFIRM", "CANCEL", "CHANGE_EVENT", "CHANGE_TICKET_QUANTITY"]:
            state["intent"] = "BOOK_EVENT"
            state["current_agent_step"] = "FILTERING_EVENTS"
            return state

    extracted = await nlu_agent.extract_intent_and_params(state["user_message"])

    state["intent"] = extracted.get("intent", "SEARCH_EVENT")
    state["search_criteria"] = extracted
    if extracted.get("ticketQuantity"):
        state["ticket_quantity"] = extracted["ticketQuantity"]

    state["current_agent_step"] = "FILTERING_EVENTS"
    await SocketManager.broadcast_agent_progress(
        step_name="FILTERING_EVENTS",
        conversation_id=conv_id,
        status="completed",
        description=f"Intent identified as {state['intent']}"
    )
    return state


async def node_search_events(state: EventAgentState) -> EventAgentState:
    """Node 3: Search Events (Runs automatically)."""
    conv_id = state.get("conversation_id", "default_conv")
    await SocketManager.broadcast_agent_progress(
        step_name="SEARCHING_EVENTS",
        conversation_id=conv_id,
        status="active",
        description="Searching event database"
    )

    criteria = state.get("search_criteria") or {}

    results = await tool_search_events(
        category=criteria.get("category"),
        city=criteria.get("city"),
        max_price=criteria.get("maxBudget")
    )

    state["search_results"] = results
    if results:
        state["selected_event"] = results[0]

    state["current_agent_step"] = "SEARCHING_EVENTS"
    await SocketManager.broadcast_agent_progress(
        step_name="SEARCHING_EVENTS",
        conversation_id=conv_id,
        status="completed",
        description=f"Found {len(results)} matching event(s)"
    )
    return state


async def node_show_event_options(state: EventAgentState) -> EventAgentState:
    """Node 4: Show Event Options."""
    results = state.get("search_results") or []

    if not results:
        state["final_response"] = NO_EVENTS_FOUND_TEMPLATE.format(
            criteria_summary=state["user_message"]
        )
    else:
        formatted_list = "\n".join([
            f"- {e['event_name']} ({e['location']}) - ${e['price']:.2f} [{e['available_tickets']} seats left]"
            for e in results[:3]
        ])
        state["final_response"] = SHOW_EVENTS_PROMPT_TEMPLATE.format(
            count=len(results),
            event_list=formatted_list
        )

    state["current_agent_step"] = "COMPLETED"
    return state


async def node_wait_for_event_selection(state: EventAgentState) -> EventAgentState:
    """Node 5: Process event choice selection."""
    conv_id = state.get("conversation_id", "default_conv")
    await SocketManager.broadcast_agent_progress(
        step_name="WAITING_FOR_SELECTION",
        conversation_id=conv_id,
        status="active",
        description="Waiting for event choice selection"
    )

    if not state.get("selected_event") and state.get("search_results"):
        state["selected_event"] = state["search_results"][0]

    state["current_agent_step"] = "WAITING_FOR_SELECTION"
    return state


async def node_ask_booking_confirmation(state: EventAgentState) -> EventAgentState:
    """Node 6: Check Availability, Ask Booking Confirmation & Set PENDING Status (PAUSE POINT)."""
    conv_id = state.get("conversation_id", "default_conv")
    evt = state.get("selected_event")

    if not evt:
        search_res = await tool_search_events()
        if search_res:
            evt = search_res[0]
            state["selected_event"] = evt

    if evt:
        event_id = evt.get("event_id") or evt.get("id")
        qty = state.get("ticket_quantity", 1)

        # Check availability before asking confirmation
        avail = await tool_check_ticket_availability(event_id=event_id, tickets_requested=qty)
        if not avail.get("available", False):
            state["error_information"] = f"Insufficient tickets available. Only {avail.get('available_tickets', 0)} left."
            state["final_response"] = UNAVAILABLE_TICKETS_TEMPLATE.format(
                available=avail.get('available_tickets', 0),
                event_title=evt.get("event_name") or evt.get("title"),
                requested=qty
            )
            state["current_agent_step"] = "COMPLETED"
            return state

        total = float(evt.get("price", 0)) * qty
        state["confirmation_status"] = "PENDING"
        state["final_response"] = ASK_CONFIRMATION_PROMPT_TEMPLATE.format(
            event_title=evt.get("event_name") or evt.get("title"),
            location=evt.get("location"),
            quantity=qty,
            total_price=total
        )
    else:
        state["error_information"] = "No event selected for booking."
        state["final_response"] = "No suitable events found for booking."

    state["current_agent_step"] = "WAITING_FOR_CONFIRMATION"

    await SocketManager.broadcast_agent_progress(
        step_name="WAITING_FOR_CONFIRMATION",
        conversation_id=conv_id,
        status="active",
        description="Paused for human confirmation"
    )
    return state


async def node_wait_for_confirmation(state: EventAgentState) -> EventAgentState:
    """Node 7: Process User Confirmation Response / Action Payload (RESUME POINT)."""
    action = (state.get("confirmation_action") or "").upper()
    msg = state["user_message"].lower()

    if action == "CONFIRM" or bool(re.search(r'\b(yes|confirm|proceed|sure|yep)\b', msg)):
        state["confirmation_status"] = "CONFIRMED"

    elif action == "CANCEL" or bool(re.search(r'\b(no|cancel|deny|stop)\b', msg)):
        state["confirmation_status"] = "CANCELLED"
        state["final_response"] = "Booking request cancelled. No tickets were issued and no payment was processed."

    elif action == "CHANGE_EVENT":
        state["confirmation_status"] = "CHANGE_EVENT"
        results = await tool_search_events()
        state["search_results"] = results
        state["final_response"] = "No problem! Please choose an alternative event from the options below:"

    elif action == "CHANGE_TICKET_QUANTITY":
        num_match = re.search(r'\b(\d+)\b', msg)
        if num_match:
            state["ticket_quantity"] = int(num_match.group(1))

        evt = state.get("selected_event")
        qty = state["ticket_quantity"]
        total = (float(evt.get("price", 0)) if evt else 0) * qty
        state["confirmation_status"] = "PENDING"
        state["final_response"] = f"Updated ticket quantity to {qty}. Total: ${total:.2f}. Click Confirm Booking to proceed."

    state["current_agent_step"] = "CHECKING_AVAILABILITY"
    return state


async def node_create_booking(state: EventAgentState) -> EventAgentState:
    """Node 8: Create Booking (SAFETY GATE)."""
    conv_id = state.get("conversation_id", "default_conv")

    if state.get("confirmation_status") != "CONFIRMED":
        state["error_information"] = "Booking blocked. Explicit user confirmation required."
        await SocketManager.broadcast_agent_progress(
            step_name="FAILED",
            conversation_id=conv_id,
            status="failed",
            description="User confirmation not granted"
        )
        return state

    evt = state.get("selected_event")
    if not evt:
        state["error_information"] = "Cannot create booking: No event selected."
        return state

    event_id = evt.get("event_id") or evt.get("id")
    qty = state.get("ticket_quantity", 1)

    # 1. CHECKING_AVAILABILITY
    await SocketManager.broadcast_agent_progress(
        step_name="CHECKING_AVAILABILITY",
        conversation_id=conv_id,
        status="active",
        description="Checking real-time seat inventory"
    )

    avail = await tool_check_ticket_availability(event_id=event_id, tickets_requested=qty)
    if not avail.get("available", False):
        state["error_information"] = f"Insufficient tickets available. Only {avail.get('available_tickets', 0)} left."
        state["final_response"] = UNAVAILABLE_TICKETS_TEMPLATE.format(
            available=avail.get('available_tickets', 0),
            event_title=evt.get("event_name") or evt.get("title"),
            requested=qty
        )
        await SocketManager.broadcast_agent_progress(
            step_name="FAILED",
            conversation_id=conv_id,
            status="failed",
            description="Insufficient seat inventory"
        )
        return state

    await SocketManager.broadcast_agent_progress(
        step_name="CHECKING_AVAILABILITY",
        conversation_id=conv_id,
        status="completed",
        description="Seats verified available"
    )

    # 2. CREATING_BOOKING
    await SocketManager.broadcast_agent_progress(
        step_name="CREATING_BOOKING",
        conversation_id=conv_id,
        status="active",
        description="Issuing ticket booking pass"
    )

    booking_res = await tool_create_booking(
        user_id=state["user_id"],
        event_id=event_id,
        ticket_quantity=qty,
        confirmed_by_user=True
    )

    if booking_res.get("status") == "CONFIRMED":
        state["booking_information"] = booking_res.get("booking")
        ref = booking_res.get("booking_reference", "BK-SUCCESS")
        total = float(evt.get("price", 0)) * qty

        state["final_response"] = BOOKING_SUCCESS_TEMPLATE.format(
            reference=ref,
            event_title=evt.get("event_name") or evt.get("title"),
            quantity=qty,
            total_price=total
        )
        await SocketManager.broadcast_agent_progress(
            step_name="CREATING_BOOKING",
            conversation_id=conv_id,
            status="completed",
            description=f"Booking issued: {ref}"
        )
    else:
        state["error_information"] = booking_res.get("error", "Booking transaction failed.")
        await SocketManager.broadcast_agent_progress(
            step_name="FAILED",
            conversation_id=conv_id,
            status="failed",
            description=state["error_information"]
        )

    state["current_agent_step"] = "CREATING_BOOKING"
    return state


async def node_add_to_calendar(state: EventAgentState) -> EventAgentState:
    """Node 9: Generate Calendar Schedule (.ics invite link)."""
    conv_id = state.get("conversation_id", "default_conv")
    await SocketManager.broadcast_agent_progress(
        step_name="ADDING_TO_CALENDAR",
        conversation_id=conv_id,
        status="active",
        description="Creating calendar schedule invite"
    )

    evt = state.get("selected_event")
    if evt:
        event_id = evt.get("event_id") or evt.get("id")
        cal_res = await tool_add_event_to_calendar(event_id=event_id, user_id=state["user_id"])
        if cal_res.get("status") == "SUCCESS":
            state["calendar_status"] = "ADDED"

    state["current_agent_step"] = "ADDING_TO_CALENDAR"
    await SocketManager.broadcast_agent_progress(
        step_name="ADDING_TO_CALENDAR",
        conversation_id=conv_id,
        status="completed",
        description="Calendar invite generated"
    )
    return state


async def node_send_notification(state: EventAgentState) -> EventAgentState:
    """Node 10: Dispatch Booking Pass Notification."""
    conv_id = state.get("conversation_id", "default_conv")
    await SocketManager.broadcast_agent_progress(
        step_name="SENDING_NOTIFICATION",
        conversation_id=conv_id,
        status="active",
        description="Dispatching e-ticket pass notification"
    )

    bkg = state.get("booking_information")
    if bkg:
        ref = bkg.get("booking_reference", "BK-8A2F9C")
        notif_res = await tool_send_booking_notification(
            booking_reference=ref,
            user_id=state["user_id"],
            channel="email"
        )
        if notif_res.get("status") == "DISPATCHED":
            state["notification_status"] = "DISPATCHED"

    state["current_agent_step"] = "SENDING_NOTIFICATION"
    await SocketManager.broadcast_agent_progress(
        step_name="SENDING_NOTIFICATION",
        conversation_id=conv_id,
        status="completed",
        description="Notification dispatched"
    )
    return state


async def node_generate_final_response(state: EventAgentState) -> EventAgentState:
    """Node 11: Synthesize Final Response for FastAPI."""
    conv_id = state.get("conversation_id", "default_conv")

    if not state.get("final_response"):
        state["final_response"] = f"Processed request: '{state['user_message']}'"

    state["current_agent_step"] = "COMPLETED"
    await SocketManager.broadcast_agent_progress(
        step_name="COMPLETED",
        conversation_id=conv_id,
        status="completed",
        description="Execution workflow completed successfully"
    )
    return state
