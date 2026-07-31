import asyncio
from app.api.v1.events import get_all_events, search_events
from app.api.v1.bookings import get_all_bookings, create_booking
from app.api.v1.agent_routes import chat_with_agent
from app.api.v1.notifications import get_notifications
from app.schemas.booking import BookingCreate
from app.schemas.agent import AgentChatRequest


async def run_fastapi_endpoint_tests():
    print("--- 1. Testing GET /api/events Endpoint ---")
    events = await get_all_events()
    print(f"GET /api/events returned {len(events)} events.")
    assert len(events) >= 1

    print("\n--- 2. Testing GET /api/events/search Endpoint ---")
    searched = await search_events(category="Music")
    print(f"GET /api/events/search (category=Music) returned {len(searched)} events.")
    assert len(searched) >= 1

    print("\n--- 3. Testing POST /api/bookings Endpoint ---")
    evt_id = str(events[0].id)
    bkg_in = BookingCreate(event_id=evt_id, user_id="api_test_user@example.com", number_of_tickets=1)
    bkg_res = await create_booking(bkg_in)
    print(f"POST /api/bookings issued reference: {bkg_res.booking_reference}")
    assert bkg_res.status == "CONFIRMED"

    print("\n--- 4. Testing POST /api/agent/chat Endpoint ---")
    chat_req = AgentChatRequest(message="Show music events in Los Angeles")
    agent_res = await chat_with_agent(payload=chat_req, current_user={"id": "api_test_user", "email": "api@test.com", "role": "ATTENDEE"})
    print(f"POST /api/agent/chat returned status: {agent_res.agent_status}")
    assert agent_res.conversation_id is not None

    print("\n--- 5. Testing GET /api/notifications Endpoint ---")
    notif_res = await get_notifications(user_id="api_test_user@example.com")
    print(f"GET /api/notifications returned {len(notif_res.notifications)} notifications.")
    assert notif_res.notifications is not None

    print("\nSUCCESS: ALL FASTAPI ENDPOINT TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_fastapi_endpoint_tests())
