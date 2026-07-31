import sys
import os
import asyncio
from datetime import datetime, timedelta
from fastapi import HTTPException

# Append app directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas.event import EventCreate, EventSearchFilter
from app.services.event_service import EventService
from app.db.session import SessionLocal, Base, engine
from app.models.event import Event as DBEvent

async def run_tests():
    print("==================================================")
    print("TESTING PATCH /api/v1/events/{eventId}/status & ATTENDEE VISIBILITY")
    print("==================================================")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    now = datetime.utcnow()

    # 1. Create a draft event owned by organizer@example.com
    draft_in = EventCreate(
        name="Secrets of Quantum Computing",
        description="Exclusive draft masterclass on quantum algorithms.",
        category="Technology",
        event_type="In-Person",
        event_date="2026-09-01",
        start_time=now + timedelta(days=30),
        end_time=now + timedelta(days=30, hours=4),
        venue_name="Quantum Lab",
        address="100 Tech Blvd",
        city="Palo Alto",
        state="CA",
        ticket_price=150.00,
        total_tickets=100,
        image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        status="DRAFT",
        organizer_id="organizer@example.com"
    )

    created_event = await EventService.create_event(draft_in)
    event_id = created_event['id']
    print(f"SUCCESS: Created initial draft event ID: {event_id} | Status: {created_event['status']}")

    # 2. Verify IMPORTANT RULE: Draft event is NOT returned to attendee event listings!
    attendee_events = await EventService.get_all_events(is_attendee=True)
    attendee_ids = [e['id'] for e in attendee_events]
    print(f"SUCCESS: Attendee event listing count (is_attendee=True): {len(attendee_events)}")
    assert event_id not in attendee_ids, "CRITICAL ERROR: Draft event must NOT be visible to attendees!"
    print("PASSED ATTENDEE VISIBILITY CHECK: Draft event is strictly hidden from attendees!")

    # 3. Test Transition: DRAFT -> PUBLISHED (by owner)
    published_event = await EventService.update_event_status(
        event_id=event_id,
        target_status="PUBLISHED",
        user_email="organizer@example.com",
        user_role="ORGANIZER"
    )
    print(f"\nSUCCESS: Transitioned DRAFT -> PUBLISHED | Status: {published_event['status']}")
    assert published_event['status'] == "PUBLISHED"

    # 4. Verify Event NOW appears in attendee event listings after publishing!
    attendee_events_after = await EventService.get_all_events(is_attendee=True)
    attendee_ids_after = [e['id'] for e in attendee_events_after]
    assert event_id in attendee_ids_after, "CRITICAL ERROR: Published event should be visible to attendees!"
    print("PASSED ATTENDEE VISIBILITY CHECK: Published event is now live for attendees!")

    # 5. Test Transition: PUBLISHED -> DRAFT (Unpublish)
    draft_again = await EventService.update_event_status(
        event_id=event_id,
        target_status="DRAFT",
        user_email="organizer@example.com",
        user_role="ORGANIZER"
    )
    print(f"\nSUCCESS: Transitioned PUBLISHED -> DRAFT | Status: {draft_again['status']}")
    assert draft_again['status'] == "DRAFT"

    # 6. Re-publish and test PUBLISHED -> CANCELLED
    await EventService.update_event_status(event_id, "PUBLISHED", "organizer@example.com", "ORGANIZER")
    cancelled_event = await EventService.update_event_status(
        event_id=event_id,
        target_status="CANCELLED",
        user_email="organizer@example.com",
        user_role="ORGANIZER"
    )
    print(f"SUCCESS: Transitioned PUBLISHED -> CANCELLED | Status: {cancelled_event['status']}")
    assert cancelled_event['status'] == "CANCELLED"

    # 7. Test Invalid Transition (CANCELLED -> PUBLISHED) should be rejected
    try:
        await EventService.update_event_status(event_id, "PUBLISHED", "organizer@example.com", "ORGANIZER")
        assert False, "Expected Invalid Transition Exception"
    except HTTPException as exc:
        print(f"SUCCESS: Invalid transition from CANCELLED correctly rejected (HTTP {exc.status_code}: {exc.detail})")

    # 8. Test RBAC Ownership Permission (Attempting to modify status by unauthorized user)
    try:
        await EventService.update_event_status(event_id, "DRAFT", "hacker@example.com", "ATTENDEE")
        assert False, "Expected 403 Forbidden Exception"
    except HTTPException as exc:
        print(f"SUCCESS: Unauthorized status change correctly blocked (HTTP {exc.status_code}: {exc.detail})")

    print("\n==================================================")
    print("SUCCESS: ALL PATCH EVENT STATUS & ATTENDEE VISIBILITY TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
