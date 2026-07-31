import asyncio
import json
from app.services.notification_service import NotificationService
from app.services.booking_service import BookingService
from app.schemas.booking import BookingCreate
from app.schemas.event import EventCreate
from app.services.event_service import EventService
from app.models.notification import NotificationType


async def run_notification_tests():
    print("--- 1. Testing Notification Creation & SocketManager Broadcast ---")
    notif1 = await NotificationService.create_notification(
        user_id="test_notif_user",
        title="Event Reminder",
        message="Acoustic Harmony Music Concert starts in 2 hours!",
        notification_type=NotificationType.EVENT_REMINDER,
        recipient="test_notif_user"
    )
    print(f"Created Notification ID: {notif1['id']}")
    print(f"Type: {notif1['notification_type']}")
    print(f"Is Read: {notif1['is_read']}")

    assert notif1["notification_type"] == "EVENT_REMINDER"
    assert notif1["is_read"] is False

    print("\n--- 2. Testing Fetching User Notifications & Unread Counter ---")
    user_notifs = await NotificationService.get_user_notifications(user_id="test_notif_user")
    print(f"Total Notifications: {len(user_notifs['notifications'])}")
    print(f"Unread Count: {user_notifs['unread_count']}")
    assert user_notifs["unread_count"] >= 1

    print("\n--- 3. Testing Mark Notification as Read ---")
    read_notif = await NotificationService.mark_as_read(notif1["id"])
    print(f"Updated Is Read: {read_notif['is_read']}")
    assert read_notif["is_read"] is True

    print("\n--- 4. Testing Automatic BOOKING_CONFIRMED Notification on Ticket Booking ---")
    events = await EventService.get_all_events()
    assert len(events) >= 1
    sample_evt = events[0]

    booking_in = BookingCreate(
        event_id=str(sample_evt["id"]),
        user_id="test_notif_user",
        number_of_tickets=2
    )
    booking = await BookingService.create_booking(booking_in)
    print(f"Booking Issued: {booking['booking_reference']}")

    # Verify automatic in-app notification creation
    updated_user_notifs = await NotificationService.get_user_notifications(user_id="test_notif_user")
    latest_notif = updated_user_notifs["notifications"][0]
    print("Latest In-App Notification:")
    print(json.dumps(latest_notif, indent=2))

    assert latest_notif["notification_type"] == "BOOKING_CONFIRMED"
    assert booking["booking_reference"] in latest_notif["message"]

    print("\nSUCCESS: ALL IN-APP REAL-TIME NOTIFICATION TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_notification_tests())
