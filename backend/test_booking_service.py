import asyncio
import json
from app.services.booking_service import BookingService
from app.services.event_service import EventService
from app.schemas.booking import BookingCreate


async def run_booking_service_tests():
    print("--- 1. Fetching Target Event for Booking ---")
    events = await EventService.get_all_events()
    assert len(events) >= 1
    sample_evt = events[0]
    initial_seats = sample_evt["available_seats"]
    evt_id = str(sample_evt["id"])

    print(f"Initial Seats for '{sample_evt['title']}': {initial_seats}")

    print("\n--- 2. Testing Booking Creation & Seat Reservation ---")
    booking_in = BookingCreate(
        event_id=evt_id,
        user_id="unit_test_user@example.com",
        number_of_tickets=2
    )
    booking = await BookingService.create_booking(booking_in)
    print(f"Booking Issued Reference: {booking['booking_reference']}")
    assert booking["status"] == "CONFIRMED"
    assert booking["number_of_tickets"] == 2

    # Check updated event seat count
    updated_evt = await EventService.get_event_by_id(evt_id)
    print(f"Updated Available Seats: {updated_evt['available_seats']}")
    assert updated_evt["available_seats"] == initial_seats - 2

    print("\n--- 3. Testing Overbooking Prevention ---")
    too_many_tickets = updated_evt["available_seats"] + 100
    try:
        overbook_in = BookingCreate(
            event_id=evt_id,
            user_id="unit_test_user@example.com",
            number_of_tickets=too_many_tickets
        )
        await BookingService.create_booking(overbook_in)
        print("ERROR: Overbooking was not blocked!")
        assert False
    except ValueError as err:
        print(f"Passed Overbooking Gate! Exception caught: {err}")
        assert "not enough tickets" in str(err).lower() or "available" in str(err).lower()

    print("\n--- 4. Testing Booking Cancellation & Seat Restoration ---")
    bkg_ref = booking["booking_reference"]
    cancel_res = await BookingService.cancel_booking(bkg_ref)
    print(f"Cancel Status: {cancel_res['status']}, Restored Seats: {cancel_res['restored_tickets']}")
    assert cancel_res["status"] == "CANCELLED"
    assert cancel_res["restored_tickets"] == 2

    restored_evt = await EventService.get_event_by_id(evt_id)
    print(f"Restored Available Seats: {restored_evt['available_seats']}")
    assert restored_evt["available_seats"] == initial_seats

    print("\nSUCCESS: BOOKING SERVICE TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_booking_service_tests())
