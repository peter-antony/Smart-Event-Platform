import logging
from app.agents.event_state import EventAgentState

logger = logging.getLogger("event_router")


def route_after_intent(state: EventAgentState) -> str:
    """Routes execution based on identified NLU intent."""
    intent = state.get("intent", "SEARCH_EVENT")
    logger.info(f"[Router: route_after_intent] Intent = {intent}")

    if intent in ["SEARCH_EVENT", "VIEW_EVENT"]:
        return "search_events"
    elif intent == "BOOK_EVENT":
        return "ask_booking_confirmation"
    elif intent == "ADD_TO_CALENDAR":
        return "add_to_calendar"
    else:
        return "generate_final_response"


def route_after_search(state: EventAgentState) -> str:
    """Routes execution after event search."""
    results = state.get("search_results") or []
    logger.info(f"[Router: route_after_search] Discovered {len(results)} events.")
    return "show_event_options"


def route_after_confirmation(state: EventAgentState) -> str:
    """
    Routes execution after confirmation check.
    CRITICAL: Only routes to create_booking if confirmation_status == 'CONFIRMED'.
    """
    status = state.get("confirmation_status", "NONE")
    logger.info(f"[Router: route_after_confirmation] Status = {status}")

    if status == "CONFIRMED":
        return "create_booking"
    else:
        return "generate_final_response"


def route_after_booking(state: EventAgentState) -> str:
    """Routes execution after booking attempt."""
    if state.get("booking_information"):
        return "add_to_calendar"
    else:
        return "generate_final_response"
