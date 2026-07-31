import asyncio
from app.services.event_service import EventService
from app.services.booking_service import BookingService
from app.schemas.booking import BookingCreate


async def run_booking_tests():
    print("--- 1. Fetching Target Event for Booking ---")
    events = await EventService.get_all_events()
    target_evt = events[0]
    evt_id = target_evt["id"]
    initial_seats = target_evt["available_seats"]
    ticket_price = target_evt["price"]
    print(f"Target Event: '{target_evt['title']}' [ID: {evt_id}]")
    print(f"Initial Available Seats: {initial_seats}, Price: ${ticket_price}")

    print("\n--- 2. Testing POST Create Booking ---")
    booking_in = BookingCreate(
        event_id=evt_id,
        user_id="user_antony_123",
        number_of_tickets=2
    )
    bkg = await BookingService.create_booking(booking_in)
    print(f"Booking Created Successfully!")
    print(f" - ID: {bkg['id']}")
    print(f" - Reference Code: {bkg['booking_reference']}")
    print(f" - Status: {bkg['status']}")
    print(f" - Tickets: {bkg['number_of_tickets']}")
    print(f" - Total Amount: ${bkg['total_amount']}")

    assert bkg["status"] == "CONFIRMED"
    assert bkg["booking_reference"].startswith("BK-")
    assert bkg["total_amount"] == ticket_price * 2

    # Check Seat Deduction
    updated_evt = await EventService.get_event_by_id(evt_id)
    new_seats = updated_evt["available_seats"]
    print(f"Updated Available Seats on Event: {new_seats}")
    assert new_seats == initial_seats - 2, "Available seats should be reduced by 2"

    print("\n--- 3. Testing Overbooking Prevention ---")
    try:
        excessive_booking = BookingCreate(
            event_id=evt_id,
            user_id="user_test",
            number_of_tickets=new_seats + 100
        )
        await BookingService.create_booking(excessive_booking)
        assert False, "Should have failed due to insufficient tickets"
    except ValueError as err:
        print(f"Correctly caught overbooking error: {err}")

    print("\n--- 4. Testing GET Bookings & User Filter ---")
    all_bkgs = await BookingService.get_all_bookings()
    user_bkgs = await BookingService.get_all_bookings(user_id="user_antony_123")
    print(f"Total bookings in system: {len(all_bkgs)}")
    print(f"Bookings for 'user_antony_123': {len(user_bkgs)}")
    assert len(user_bkgs) >= 1

    print("\n--- 5. Testing GET Booking by ID & Reference Code ---")
    by_id = await BookingService.get_booking_by_id(bkg["id"])
    by_ref = await BookingService.get_booking_by_id(bkg["booking_reference"])
    assert by_id["id"] == bkg["id"]
    assert by_ref["id"] == bkg["id"]
    print(f"Successfully retrieved booking by UUID and Reference Code '{bkg['booking_reference']}'")

    print("\n--- 6. Testing POST Cancel Booking ---")
    cancel_res = await BookingService.cancel_booking(bkg["booking_reference"])
    print(f"Cancellation Result: {cancel_res['message']}")
    assert cancel_res["status"] == "CANCELLED"
    assert cancel_res["restored_tickets"] == 2

    # Verify Seat Restoration on Event
    restored_evt = await EventService.get_event_by_id(evt_id)
    restored_seats = restored_evt["available_seats"]
    print(f"Restored Available Seats on Event: {restored_seats}")
    assert restored_seats == initial_seats, "Available seats should be fully restored after cancellation"

    print("\n--- 7. Testing Repeat Cancellation Error ---")
    try:
        await BookingService.cancel_booking(bkg["booking_reference"])
        assert False, "Should have failed to cancel already cancelled booking"
    except ValueError as err:
        print(f"Correctly caught repeat cancellation error: {err}")

    print("\nSUCCESS: ALL TICKET BOOKING LAYER TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_booking_tests())
