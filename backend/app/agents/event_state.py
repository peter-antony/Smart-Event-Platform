from typing import TypedDict, Optional, List, Dict, Any


class EventAgentState(TypedDict):
    """
    Complete state dictionary for Smart Event Platform LangGraph agent pipeline.
    Maintains state persistence across multi-turn conversation steps and HITL pauses.
    """
    user_id: str
    conversation_id: str
    user_message: str
    intent: Optional[str]
    search_criteria: Optional[Dict[str, Any]]
    search_results: List[Dict[str, Any]]
    selected_event: Optional[Dict[str, Any]]
    ticket_quantity: int
    booking_information: Optional[Dict[str, Any]]
    confirmation_status: str        # "NONE", "PENDING", "CONFIRMED", "CANCELLED", "CHANGE_EVENT"
    confirmation_action: Optional[str]  # "CONFIRM", "CANCEL", "CHANGE_EVENT", "CHANGE_TICKET_QUANTITY"
    calendar_status: str            # "NONE", "ADDED"
    notification_status: str        # "NONE", "DISPATCHED"
    current_agent_step: str
    final_response: str
    error_information: Optional[str]


def create_initial_state(
    user_message: str,
    user_id: str = "user_default",
    conversation_id: str = "",
    confirmation_action: Optional[str] = None
) -> EventAgentState:
    """Helper factory for initializing clean EventAgentState instances."""
    return {
        "user_id": user_id,
        "conversation_id": conversation_id,
        "user_message": user_message,
        "intent": None,
        "search_criteria": None,
        "search_results": [],
        "selected_event": None,
        "ticket_quantity": 1,
        "booking_information": None,
        "confirmation_status": "NONE",
        "confirmation_action": confirmation_action,
        "calendar_status": "NONE",
        "notification_status": "NONE",
        "current_agent_step": "understand_request",
        "final_response": "",
        "error_information": None
    }
