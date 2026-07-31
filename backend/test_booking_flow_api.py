import sys
import os
import asyncio
from datetime import datetime, timedelta
from fastapi import HTTPException

# Append app directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas.event import EventCreate
from app.schemas.booking import BookingCreate
from app.services.event_service import EventService
from app.services.booking_service import BookingService
from app.db.session import SessionLocal, Base, engine
from app.models.event import Event as DBEvent

async def run_tests():
    print("==================================================")
    print("TESTING POST /api/v1/bookings & ATOMIC DB TRANSACTIONS")
    print("==================================================")

    # Ensure tables exist
    Base.metadata.create_all(bind=engine)
    now = datetime.utcnow()

    # 1. Create a published event with 10 available seats
    event_in = EventCreate(
        name="Backend Microservices Masterclass",
        description="Deep dive into FastAPI and DB transactions.",
        category="Technology",
        event_type="In-Person",
        event_date="2026-09-10",
        start_time=now + timedelta(days=20),
        end_time=now + timedelta(days=20, hours=4),
        venue_name="Tech Hub",
        address="100 Tech St",
        city="San Francisco",
        state="CA",
        ticket_price=100.00,
        total_tickets=10,
        available_seats=10,
        image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        status="PUBLISHED",
        organizer_id="organizer@example.com"
    )

    created_event = await EventService.create_event(event_in)
    event_id = created_event['id']
    initial_seats = created_event['available_seats']
    print(f"SUCCESS: Created published event ID: {event_id} with {initial_seats} available seats")

    # 2. Test Booking 3 tickets via POST /api/v1/bookings
    bkg_in = BookingCreate(
        event_id=event_id,
        user_id="attendee@example.com",
        number_of_tickets=3
    )

    booking = await BookingService.create_booking(bkg_in)
    bkg_ref = booking["booking_reference"]
    total = booking["total_amount"]
    print(f"SUCCESS: Created booking ID: {booking['id']} | Ref: {bkg_ref} | Total: ${total}")
    assert booking["status"] == "CONFIRMED"
    assert booking["number_of_tickets"] == 3
    assert total == 300.00

    # 3. Verify Atomic DB Reduction: available seats must now be 7 (10 - 3)
    updated_event = await EventService.get_event_by_id(event_id)
    seats_remaining = updated_event["available_seats"]
    print(f"SUCCESS: Verified atomic seat reduction -> Initial: {initial_seats}, Remaining: {seats_remaining}")
    assert seats_remaining == 7, f"Expected 7 remaining seats, got {seats_remaining}"

    # 4. Test Pre-booking Check: Attempting to book 15 tickets (exceeding 7 available) should fail
    excess_bkg = BookingCreate(
        event_id=event_id,
        user_id="attendee@example.com",
        number_of_tickets=15
    )
    try:
        await BookingService.create_booking(excess_bkg)
        assert False, "Expected 400 Bad Request for oversold tickets"
    except HTTPException as exc:
        print(f"SUCCESS: Oversold ticket check passed (HTTP {exc.status_code}: {exc.detail})")

    # 5. Test Pre-booking Check: Attempting to book draft event should fail
    draft_in = EventCreate(
        name="Draft Private Summit",
        description="Draft event.",
        category="Technology",
        event_type="In-Person",
        city="Austin",
        status="DRAFT",
        organizer_id="organizer@example.com"
    )
    draft_evt = await EventService.create_event(draft_in)
    draft_bkg = BookingCreate(event_id=draft_evt['id'], user_id="attendee@example.com", number_of_tickets=1)
    try:
        await BookingService.create_booking(draft_bkg)
        assert False, "Expected 400 Bad Request for draft event booking"
    except HTTPException as exc:
        print(f"SUCCESS: Draft event status check passed (HTTP {exc.status_code}: {exc.detail})")

    print("\n==================================================")
    print("SUCCESS: ALL POST /api/v1/bookings & DB TRANSACTION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
