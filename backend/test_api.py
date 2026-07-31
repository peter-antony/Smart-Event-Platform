import asyncio
from datetime import datetime, timezone, timedelta
from app.services.event_service import EventService
from app.schemas.event import EventCreate, EventUpdate, EventSearchFilter


async def run_tests():
    print("--- 1. Testing GET All Events ---")
    all_events = await EventService.get_all_events()
    print(f"Total events found: {len(all_events)}")
    for e in all_events:
        print(f" - [{e['category']}] {e['title']} ({e['city']}) - ${e['price']} [UUID: {e['id']}]")

    assert len(all_events) >= 6, "Expected at least 6 sample events seeded"

    print("\n--- 2. Testing GET Search API Filters ---")
    # Search by Category
    tech_events = await EventService.search_events(EventSearchFilter(category="Tech Conference"))
    print(f"Found {len(tech_events)} Tech Conference events")
    assert len(tech_events) >= 1

    # Search by City
    ny_events = await EventService.search_events(EventSearchFilter(city="New York"))
    print(f"Found {len(ny_events)} New York events")
    assert len(ny_events) >= 1

    # Search by Price Range
    cheap_events = await EventService.search_events(EventSearchFilter(max_price=50.0))
    print(f"Found {len(cheap_events)} events under $50.00")

    print("\n--- 3. Testing POST Create Event ---")
    now = datetime.now(timezone.utc)
    new_evt_data = EventCreate(
        title="Automated Test Hackathon",
        description="Testing event creation API",
        category="Technology",
        city="Seattle",
        location="Convention Center",
        is_virtual=True,
        start_time=now + timedelta(days=1),
        end_time=now + timedelta(days=2),
        price=10.0,
        capacity=100,
        available_seats=100,
        tags=["Test", "Hackathon"]
    )
    created_evt = await EventService.create_event(new_evt_data)
    print(f"Created Event ID: {created_evt['id']}")
    assert created_evt["title"] == "Automated Test Hackathon"

    print("\n--- 4. Testing PUT Update Event ---")
    updated_evt = await EventService.update_event(
        created_evt['id'],
        EventUpdate(price=15.0, available_seats=95)
    )
    print(f"Updated price: ${updated_evt['price']}, available_seats: {updated_evt['available_seats']}")
    assert updated_evt["price"] == 15.0

    print("\n--- 5. Testing DELETE Event ---")
    delete_result = await EventService.delete_event(created_evt['id'])
    print(f"Deleted successfully: {delete_result}")
    assert delete_result is True

    print("\nSUCCESS: ALL EVENT MANAGEMENT LAYER TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_tests())
