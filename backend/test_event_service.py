import asyncio
import json
from app.services.event_service import EventService
from app.schemas.event import EventSearchFilter, EventCreate


async def run_event_service_tests():
    print("--- 1. Testing EventService.get_all_events() ---")
    events = await EventService.get_all_events()
    print(f"Total Events Found: {len(events)}")
    assert len(events) >= 1

    sample_id = str(events[0]["id"])

    print("\n--- 2. Testing EventService.get_event_by_id() ---")
    event = await EventService.get_event_by_id(sample_id)
    print(f"Fetched Event Title: '{event['title']}' ({event['city']})")
    assert event["id"] == sample_id

    print("\n--- 3. Testing EventService.search_events() with Filters ---")
    filter_music = EventSearchFilter(category="Music", max_price=100.0)
    filtered = await EventService.search_events(filter_music)
    print(f"Filtered Music Events: {len(filtered)}")
    assert len(filtered) >= 1
    assert filtered[0]["category"] == "Music"

    print("\nSUCCESS: EVENT SERVICE TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_event_service_tests())
