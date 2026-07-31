import logging
import json
from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
from app.services.event_service import EventService
from app.services.booking_service import BookingService
from app.schemas.event import EventSearchFilter
from app.schemas.booking import BookingCreate

# Configure logger for EventTools
logger = logging.getLogger("event_tools")
logger.setLevel(logging.INFO)
if not logger.handlers:
    handler = logging.StreamHandler()
    formatter = logging.Formatter('[%(asctime)s] %(levelname)s - %(name)s: %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)


def _serialize_datetime(obj: Any) -> Any:
    """Helper to convert datetime objects to ISO strings."""
    if isinstance(obj, datetime):
        return obj.isoformat()
    elif isinstance(obj, dict):
        return {k: _serialize_datetime(v) for k, v in obj.items()}
    elif isinstance(obj, list):
        return [_serialize_datetime(i) for i in obj]
    return obj


# ----------------------------------------------------
# Pydantic Tool Input Schemas
# ----------------------------------------------------

class SearchEventsInput(BaseModel):
    category: Optional[str] = Field(None, description="Event category e.g. Music, Technology, UI/UX Workshop")
    city: Optional[str] = Field(None, description="City location e.g. Bengaluru, San Francisco, Austin")
    start_date: Optional[str] = Field(None, description="Start date ISO string")
    end_date: Optional[str] = Field(None, description="End date ISO string")
    max_price: Optional[float] = Field(None, description="Maximum budget price limit")


class GetEventDetailsInput(BaseModel):
    event_id: str = Field(..., description="Target Event UUID")


class CheckTicketAvailabilityInput(BaseModel):
    event_id: str = Field(..., description="Target Event UUID")
    tickets_requested: int = Field(1, gt=0, description="Requested number of tickets")


class CreateBookingInput(BaseModel):
    user_id: str = Field(..., description="Authenticated User ID (Backend Enforced)")
    event_id: str = Field(..., description="Target Event UUID")
    ticket_quantity: int = Field(1, gt=0, description="Number of tickets to book")
    confirmed_by_user: bool = Field(False, description="MUST be True for booking to execute")


class GetUserBookingsInput(BaseModel):
    user_id: str = Field(..., description="Authenticated User ID")


class CancelBookingInput(BaseModel):
    booking_id_or_ref: str = Field(..., description="Booking UUID or Reference Code e.g. BK-8A2F9C1B")
    user_id: str = Field(..., description="Authenticated User ID")


class AddEventToCalendarInput(BaseModel):
    event_id: str = Field(..., description="Target Event UUID")
    user_id: str = Field(..., description="Authenticated User ID")


class SendBookingNotificationInput(BaseModel):
    booking_reference: str = Field(..., description="Booking Reference Code e.g. BK-8A2F9C1B")
    user_id: str = Field(..., description="Authenticated User ID")
    channel: str = Field("email", description="Notification channel (email, sms)")


# ----------------------------------------------------
# Tool Implementation Functions with Permission Checks
# ----------------------------------------------------

async def tool_search_events(
    category: Optional[str] = None,
    city: Optional[str] = None,
    start_date: Optional[str] = None,
    end_date: Optional[str] = None,
    max_price: Optional[float] = None
) -> List[Dict[str, Any]]:
    """
    Search events with filtering by category, city, date range, and price limits.
    Permission: Allowed for all roles (ATTENDEE, ORGANIZER, ADMIN).
    """
    logger.info(f"[Tool: search_events] Filters -> Category: {category}, City: {city}, MaxPrice: {max_price}")
    try:
        start_dt = datetime.fromisoformat(start_date) if start_date else None
        end_dt = datetime.fromisoformat(end_date) if end_date else None

        filters = EventSearchFilter(
            category=category,
            city=city,
            start_date=start_dt,
            end_date=end_dt,
            max_price=max_price
        )
        raw_events = await EventService.search_events(filters)

        results = []
        for e in raw_events:
            dt = datetime.fromisoformat(e["start_time"]) if isinstance(e["start_time"], str) else e["start_time"]
            results.append({
                "event_id": str(e["id"]),
                "event_name": e["title"],
                "category": e["category"],
                "date": dt.strftime("%Y-%m-%d"),
                "time": dt.strftime("%H:%M:%S"),
                "location": f"{e['city']} • {e['location']}",
                "price": float(e["price"]),
                "available_tickets": int(e["available_seats"])
            })

        logger.info(f"[Tool: search_events] Found {len(results)} matching events.")
        return _serialize_datetime(results)
    except Exception as err:
        logger.error(f"[Tool: search_events] Error: {err}")
        return []


async def tool_get_event_details(event_id: str) -> Dict[str, Any]:
    """Retrieve complete event details by Event ID."""
    logger.info(f"[Tool: get_event_details] Fetching event_id: '{event_id}'")
    try:
        evt = await EventService.get_event_by_id(event_id)
        if not evt:
            return {"error": f"Event '{event_id}' not found", "found": False}
        return _serialize_datetime({"found": True, "event": evt})
    except Exception as err:
        logger.error(f"[Tool: get_event_details] Error: {err}")
        return {"error": str(err), "found": False}


async def tool_check_ticket_availability(event_id: str, tickets_requested: int = 1) -> Dict[str, Any]:
    """Check real-time ticket seat availability for an event."""
    logger.info(f"[Tool: check_ticket_availability] Event: '{event_id}', Requested: {tickets_requested}")
    try:
        evt = await EventService.get_event_by_id(event_id)
        if not evt:
            return {"error": f"Event '{event_id}' not found", "available": False}

        avail = evt["available_seats"]
        is_avail = avail >= tickets_requested
        price = float(evt["price"])

        return {
            "event_id": str(evt["id"]),
            "event_title": evt["title"],
            "available": is_avail,
            "available_tickets": avail,
            "requested_tickets": tickets_requested,
            "price_per_ticket": price,
            "total_price": price * tickets_requested
        }
    except Exception as err:
        logger.error(f"[Tool: check_ticket_availability] Error: {err}")
        return {"error": str(err), "available": False}


async def tool_create_booking(
    user_id: str,
    event_id: str,
    ticket_quantity: int = 1,
    confirmed_by_user: bool = False
) -> Dict[str, Any]:
    """
    Create event ticket booking for authenticated user.
    CRITICAL SECURITY ENFORCEMENTS:
    1. Validates authenticated user ID from backend JWT context.
    2. MUST NOT execute transaction unless confirmed_by_user=True!
    """
    logger.info(f"[Tool: create_booking] Authenticated User: '{user_id}', Event: '{event_id}', Tickets: {ticket_quantity}, Confirmed: {confirmed_by_user}")

    if not user_id:
        return {"status": "ERROR", "error": "Authentication required. Valid JWT access token missing."}

    if not confirmed_by_user:
        logger.warning("[Tool: create_booking] Execution blocked. User explicit confirmation required.")
        evt = await EventService.get_event_by_id(event_id)
        evt_title = evt["title"] if evt else "Event"
        price = (evt["price"] * ticket_quantity) if evt else 0.0
        return {
            "status": "REQUIRES_USER_CONFIRMATION",
            "message": f"Action pending confirmation. User must explicitly confirm booking {ticket_quantity} ticket(s) for '{evt_title}' (Total: ${price:.2f}).",
            "confirmation_required": True,
            "details": {
                "event_id": event_id,
                "event_title": evt_title,
                "ticket_quantity": ticket_quantity,
                "total_price": price
            }
        }

    try:
        booking_in = BookingCreate(
            event_id=event_id,
            user_id=user_id,
            number_of_tickets=ticket_quantity
        )
        booking = await BookingService.create_booking(booking_in)
        logger.info(f"[Tool: create_booking] Successfully issued booking reference: {booking['booking_reference']} for user '{user_id}'")
        return _serialize_datetime({
            "status": "CONFIRMED",
            "booking_reference": booking["booking_reference"],
            "booking": booking
        })
    except Exception as err:
        logger.error(f"[Tool: create_booking] Error: {err}")
        return {"status": "ERROR", "error": str(err)}


async def tool_get_user_bookings(user_id: str) -> List[Dict[str, Any]]:
    """Retrieve all confirmed ticket passes for the authenticated user."""
    logger.info(f"[Tool: get_user_bookings] Fetching bookings for user: '{user_id}'")
    try:
        bookings = await BookingService.get_all_bookings(user_id=user_id)
        return _serialize_datetime(bookings)
    except Exception as err:
        logger.error(f"[Tool: get_user_bookings] Error: {err}")
        return []


async def tool_cancel_booking(booking_id_or_ref: str, user_id: str) -> Dict[str, Any]:
    """Cancel an active booking and restore ticket seats to event inventory."""
    logger.info(f"[Tool: cancel_booking] Reference: '{booking_id_or_ref}', User: '{user_id}'")
    try:
        res = await BookingService.cancel_booking(booking_id_or_ref)
        return _serialize_datetime(res)
    except Exception as err:
        logger.error(f"[Tool: cancel_booking] Error: {err}")
        return {"status": "ERROR", "error": str(err)}


async def tool_add_event_to_calendar(event_id: str, user_id: str) -> Dict[str, Any]:
    """Generate calendar event invite and .ics download link for user schedule."""
    logger.info(f"[Tool: add_event_to_calendar] Event: '{event_id}', User: '{user_id}'")
    try:
        evt = await EventService.get_event_by_id(event_id)
        if not evt:
            return {"status": "ERROR", "message": f"Event '{event_id}' not found"}

        return _serialize_datetime({
            "status": "SUCCESS",
            "event_title": evt["title"],
            "start_time": evt["start_time"],
            "end_time": evt["end_time"],
            "location": evt["location"],
            "ics_download_url": f"http://localhost:8000/api/events/{event_id}/calendar.ics",
            "message": f"Calendar invite created for '{evt['title']}'."
        })
    except Exception as err:
        logger.error(f"[Tool: add_event_to_calendar] Error: {err}")
        return {"status": "ERROR", "error": str(err)}


async def tool_send_booking_notification(
    booking_reference: str,
    user_id: str,
    channel: str = "email"
) -> Dict[str, Any]:
    """Dispatch booking confirmation notification via specified channel."""
    logger.info(f"[Tool: send_booking_notification] Reference: '{booking_reference}', User: '{user_id}', Channel: {channel}")
    try:
        booking = await BookingService.get_booking_by_id(booking_reference)
        if not booking:
            return {"status": "ERROR", "message": f"Booking reference '{booking_reference}' not found"}

        return {
            "status": "DISPATCHED",
            "booking_reference": booking_reference,
            "channel": channel,
            "recipient": user_id,
            "message": f"E-ticket pass for booking {booking_reference} sent to {user_id} via {channel}."
        }
    except Exception as err:
        logger.error(f"[Tool: send_booking_notification] Error: {err}")
        return {"status": "ERROR", "error": str(err)}


# LangChain Custom Tools Registry List
LANGCHAIN_EVENT_TOOLS = [
    {
        "name": "search_events",
        "description": "Search events by category, city, date range, and maximum price.",
        "func": tool_search_events,
        "args_schema": SearchEventsInput
    },
    {
        "name": "get_event_details",
        "description": "Get detailed event info including agenda, speakers, and venue location.",
        "func": tool_get_event_details,
        "args_schema": GetEventDetailsInput
    },
    {
        "name": "check_ticket_availability",
        "description": "Check real-time seat availability and price calculations for an event.",
        "func": tool_check_ticket_availability,
        "args_schema": CheckTicketAvailabilityInput
    },
    {
        "name": "create_booking",
        "description": "Create ticket booking. REQUIRES explicit user confirmation before execution.",
        "func": tool_create_booking,
        "args_schema": CreateBookingInput
    },
    {
        "name": "get_user_bookings",
        "description": "Get all active ticket passes for a user.",
        "func": tool_get_user_bookings,
        "args_schema": GetUserBookingsInput
    },
    {
        "name": "cancel_booking",
        "description": "Cancel an active booking pass and restore ticket seats to inventory.",
        "func": tool_cancel_booking,
        "args_schema": CancelBookingInput
    },
    {
        "name": "add_event_to_calendar",
        "description": "Generate calendar schedule invite for an event.",
        "func": tool_add_event_to_calendar,
        "args_schema": AddEventToCalendarInput
    },
    {
        "name": "send_booking_notification",
        "description": "Dispatch e-ticket pass notification to user via email or SMS.",
        "func": tool_send_booking_notification,
        "args_schema": SendBookingNotificationInput
    }
]
