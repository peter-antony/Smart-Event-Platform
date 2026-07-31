import sys
import os
import asyncio

# Append app directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas.event import EventSearchFilter
from app.services.event_service import EventService
from app.repositories.event_repository import EventRepository

async def run_tests():
    print("==================================================")
    print("TESTING GET /api/v1/events ORGANIZER OWNERSHIP & STATUS FILTERING")
    print("==================================================")

    # Test 1: Fetch events for demo organizer
    filter_org1 = EventSearchFilter(organizer_id="organizer@example.com")
    events_org1 = await EventService.search_events(filter_org1)
    print(f"SUCCESS: Found {len(events_org1)} event(s) for organizer@example.com")
    for e in events_org1:
        print(f"   - Event '{e['title']}' | Status: {e['status']} | Organizer: {e['organizer_id']}")
        assert e['organizer_id'] == "organizer@example.com", f"Expected organizer@example.com, got {e['organizer_id']}"

    # Test 2: Fetch events for other organizer (Isolation verification)
    filter_org2 = EventSearchFilter(organizer_id="other_organizer@example.com")
    events_org2 = await EventService.search_events(filter_org2)
    print(f"\nSUCCESS: Found {len(events_org2)} event(s) for other_organizer@example.com")
    for e in events_org2:
        print(f"   - Event '{e['title']}' | Status: {e['status']} | Organizer: {e['organizer_id']}")
        assert e['organizer_id'] == "other_organizer@example.com"

    # Test 3: Status filtering for PUBLISHED events
    filter_pub = EventSearchFilter(organizer_id="organizer@example.com", status="PUBLISHED")
    events_pub = await EventService.search_events(filter_pub)
    print(f"\nSUCCESS: Found {len(events_pub)} PUBLISHED event(s) for organizer@example.com")
    for e in events_pub:
        assert e['status'].upper() == "PUBLISHED"

    # Test 4: Status filtering for DRAFT events
    filter_draft = EventSearchFilter(organizer_id="organizer@example.com", status="DRAFT")
    events_draft = await EventService.search_events(filter_draft)
    print(f"SUCCESS: Found {len(events_draft)} DRAFT event(s) for organizer@example.com")
    for e in events_draft:
        assert e['status'].upper() == "DRAFT"

    print("\n==================================================")
    print("SUCCESS: ALL ORGANIZER OWNERSHIP & STATUS FILTER TESTS PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
