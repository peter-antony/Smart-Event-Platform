import sys
import os
import asyncio

# Append app directory to PYTHONPATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from app.schemas.booking import BookingCreate
from app.services.booking_service import BookingService
from app.services.event_service import EventService

async def run_tests():
    print("==================================================")
    print("TESTING GET /api/v1/bookings/my & CANCELLATION WORKFLOW")
    print("==================================================")

    user_email = "test_my_attendee@example.com"

    # 1. Fetch published events
    published_events = await EventService.get_all_events(is_attendee=True)
    assert len(published_events) > 0
    event_id = published_events[0]["id"]

    # 2. Create 2 bookings for attendee
    bkg1 = await BookingService.create_booking(
        BookingCreate(event_id=event_id, user_id=user_email, number_of_tickets=2)
    )
    bkg2 = await BookingService.create_booking(
        BookingCreate(event_id=event_id, user_id=user_email, number_of_tickets=1)
    )

    print(f"SUCCESS: Created Booking 1 Ref: {bkg1['booking_reference']} | Booking 2 Ref: {bkg2['booking_reference']}")

    # 3. Test GET /api/v1/bookings/my
    my_bookings = await BookingService.get_all_bookings(user_id=user_email)
    print(f"SUCCESS: Found {len(my_bookings)} booking(s) for {user_email}")
    assert len(my_bookings) >= 2, f"Expected at least 2 bookings, got {len(my_bookings)}"

    # 4. Test Cancellation Workflow: Cancel Booking 1
    cancel_res = await BookingService.cancel_booking(bkg1["id"])
    print(f"SUCCESS: Cancelled Booking {bkg1['booking_reference']} | Restored: {cancel_res['restored_tickets']} tickets")
    assert cancel_res["status"] == "CANCELLED"
    assert cancel_res["restored_tickets"] == 2

    # 5. Verify Booking 1 status updated in GET /api/v1/bookings/my
    my_bookings_after = await BookingService.get_all_bookings(user_id=user_email)
    cancelled_item = next(b for b in my_bookings_after if b["id"] == bkg1["id"])
    assert cancelled_item["status"] == "CANCELLED"
    print("SUCCESS: Verified booking status updated to CANCELLED in attendee list!")

    print("\n==================================================")
    print("SUCCESS: GET /api/v1/bookings/my & CANCELLATION TESTS PASSED CLEANLY!")
    print("==================================================")

if __name__ == "__main__":
    asyncio.run(run_tests())
