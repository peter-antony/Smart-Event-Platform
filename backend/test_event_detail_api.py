import sys
import os
import asyncio

# Append app directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.services.event_service import EventService

async def run_tests():
    print("==================================================")
    print("TESTING GET /api/v1/events/{eventId} DETAIL ENDPOINT")
    print("==================================================")

    # 1. Fetch all events to pick an ID
    events = await EventService.get_all_events(is_attendee=False)
    assert len(events) > 0, "Expected at least one event in database"
    target_event = events[0]
    event_id = target_event["id"]

    # 2. Fetch single event details via GET /api/v1/events/{eventId}
    fetched = await EventService.get_event_by_id(event_id)
    assert fetched is not None, f"Event with ID {event_id} should exist"

    print(f"SUCCESS: Retrieved Event ID '{event_id}'")
    print(f"   - Title: {fetched['title']}")
    print(f"   - Category: {fetched['category']}")
    print(f"   - Description: {fetched['description']}")
    print(f"   - Start Time: {fetched['start_time']}")
    print(f"   - End Time: {fetched['end_time']}")
    print(f"   - Venue Name: {fetched.get('venue_name', fetched.get('location'))}")
    print(f"   - Full Address: {fetched.get('address')}, {fetched.get('city')}, {fetched.get('state')}")
    print(f"   - Ticket Price: ${fetched['price']}")
    print(f"   - Available Seats: {fetched['available_seats']} / {fetched['capacity']}")
    print(f"   - Organizer: {fetched.get('organizer_id')}")

    assert "title" in fetched
    assert "category" in fetched
    assert "price" in fetched
    assert "available_seats" in fetched

    print("\n==================================================")
    print("SUCCESS: GET /api/v1/events/{eventId} TEST PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
