import sys
import os
import asyncio

# Append app directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas.event import EventSearchFilter
from app.services.event_service import EventService

async def run_tests():
    print("==================================================")
    print("TESTING GET /api/v1/events/published ENDPOINT")
    print("==================================================")

    # Fetch all published events
    filter_published = EventSearchFilter(status="PUBLISHED")
    published_events = await EventService.search_events(filter_published)

    print(f"SUCCESS: Found {len(published_events)} published event(s)")
    for evt in published_events:
        print(f"   - Title: '{evt['title']}' | Status: {evt['status']} | City: {evt['city']} | Price: ${evt['price']}")
        assert evt['status'].upper() == "PUBLISHED", f"Expected PUBLISHED status, got {evt['status']}"

    # Category filter test on published events
    filter_music = EventSearchFilter(status="PUBLISHED", category="Music")
    music_events = await EventService.search_events(filter_music)
    print(f"\nSUCCESS: Found {len(music_events)} published Music event(s)")
    for evt in music_events:
        assert "music" in evt['category'].lower()

    print("\n==================================================")
    print("SUCCESS: GET /api/v1/events/published TEST PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
