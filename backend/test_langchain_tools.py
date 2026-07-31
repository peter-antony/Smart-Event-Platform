import asyncio
import json
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


async def run_tool_tests():
    print("--- 1. Testing Tool: search_events ---")
    events = await tool_search_events(category="Music", max_price=100.0)
    print(f"search_events Output ({len(events)} found):")
    print(json.dumps(events, indent=2))
    assert len(events) >= 1
    sample_evt = events[0]
    assert "event_id" in sample_evt
    assert "event_name" in sample_evt
    assert "date" in sample_evt
    assert "time" in sample_evt
    assert "location" in sample_evt
    assert "price" in sample_evt
    assert "available_tickets" in sample_evt

    evt_id = sample_evt["event_id"]

    print("\n--- 2. Testing Tool: get_event_details ---")
    details = await tool_get_event_details(event_id=evt_id)
    print(f"get_event_details Output: Found = {details['found']}")
    assert details["found"] is True

    print("\n--- 3. Testing Tool: check_ticket_availability ---")
    avail = await tool_check_ticket_availability(event_id=evt_id, tickets_requested=2)
    print("check_ticket_availability Output:")
    print(json.dumps(avail, indent=2))
    assert avail["available"] is True
    assert avail["total_price"] == sample_evt["price"] * 2

    print("\n--- 4. Testing Tool: create_booking (Unconfirmed Block) ---")
    unconfirmed = await tool_create_booking(
        user_id="test_user@example.com",
        event_id=evt_id,
        ticket_quantity=2,
        confirmed_by_user=False
    )
    print("create_booking (Unconfirmed) Output:")
    print(json.dumps(unconfirmed, indent=2))
    assert unconfirmed["status"] == "REQUIRES_USER_CONFIRMATION"

    print("\n--- 5. Testing Tool: create_booking (Confirmed Execution) ---")
    confirmed = await tool_create_booking(
        user_id="test_user@example.com",
        event_id=evt_id,
        ticket_quantity=2,
        confirmed_by_user=True
    )
    print("create_booking (Confirmed) Output:")
    print(json.dumps(confirmed, indent=2))
    assert confirmed["status"] == "CONFIRMED"
    booking_ref = confirmed["booking_reference"]

    print("\n--- 6. Testing Tool: get_user_bookings ---")
    user_bkgs = await tool_get_user_bookings(user_id="test_user@example.com")
    print(f"get_user_bookings Output: {len(user_bkgs)} booking(s) found.")
    assert len(user_bkgs) >= 1

    print("\n--- 7. Testing Tool: add_event_to_calendar ---")
    cal = await tool_add_event_to_calendar(event_id=evt_id, user_id="test_user@example.com")
    print("add_event_to_calendar Output:")
    print(json.dumps(cal, indent=2))
    assert cal["status"] == "SUCCESS"

    print("\n--- 8. Testing Tool: send_booking_notification ---")
    notif = await tool_send_booking_notification(
        booking_reference=booking_ref,
        user_id="test_user@example.com",
        channel="email"
    )
    print("send_booking_notification Output:")
    print(json.dumps(notif, indent=2))
    assert notif["status"] == "DISPATCHED"

    print("\n--- 9. Testing Tool: cancel_booking ---")
    cancel_res = await tool_cancel_booking(booking_id_or_ref=booking_ref, user_id="test_user@example.com")
    print("cancel_booking Output:")
    print(json.dumps(cancel_res, indent=2))
    assert cancel_res["status"] == "CANCELLED"

    print("\nSUCCESS: ALL 8 LANGCHAIN EVENT TOOLS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_tool_tests())
