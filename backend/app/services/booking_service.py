import logging
from typing import List, Dict, Any, Optional, Union
from app.repositories.booking_repository import BookingRepository
from app.schemas.booking import BookingCreate
from app.services.notification_service import NotificationService
from app.models.notification import NotificationType

logger = logging.getLogger("booking_service")
booking_repo = BookingRepository()


class BookingService:

    @staticmethod
    async def create_booking(
        booking_or_event_id: Union[BookingCreate, str],
        user_id: Optional[str] = None,
        number_of_tickets: Optional[int] = None
    ) -> Dict[str, Any]:
        """
        Creates a ticket booking atomically, reduces available seats, and triggers a real-time BOOKING_CONFIRMED notification.
        """
        if isinstance(booking_or_event_id, BookingCreate):
            event_id = booking_or_event_id.event_id
            uid = booking_or_event_id.user_id or booking_or_event_id.attendee_id or user_id or "attendee@example.com"
            qty = (
                booking_or_event_id.number_of_tickets or
                booking_or_event_id.ticket_quantity or
                booking_or_event_id.quantity or
                number_of_tickets or
                1
            )
        else:
            event_id = booking_or_event_id
            uid = user_id or "attendee@example.com"
            qty = number_of_tickets or 1

        logger.info(f"[BookingService] Creating booking for user: '{uid}', Event: '{event_id}', Quantity: {qty}")
        booking = await booking_repo.create_booking(event_id=event_id, user_id=uid, number_of_tickets=qty)

        # Trigger In-App Notification after successful booking
        evt_title = booking.get("event", {}).get("title", "Event")
        ref_code = booking.get("booking_reference", "")

        await NotificationService.create_notification(
            user_id=uid,
            title="Booking Confirmed!",
            message=f"Your reservation for {qty} ticket pass(es) for '{evt_title}' is confirmed. Reference: {ref_code}.",
            notification_type=NotificationType.BOOKING_CONFIRMED,
            booking_id=booking.get("id"),
            recipient=uid
        )

        return booking

    @staticmethod
    async def get_booking_by_id(booking_id_or_ref: str) -> Optional[Dict[str, Any]]:
        return await booking_repo.get_by_id(booking_id_or_ref)

    @staticmethod
    async def get_all_bookings(user_id: Optional[str] = None) -> List[Dict[str, Any]]:
        return await booking_repo.get_all(user_id=user_id)

    @staticmethod
    async def cancel_booking(booking_id_or_ref: str) -> Dict[str, Any]:
        """
        Cancels booking, restores tickets to event inventory, and triggers an EVENT_CANCELLED in-app notification.
        """
        res = await booking_repo.cancel_booking(booking_id_or_ref)
        if res.get("status") == "CANCELLED":
            await NotificationService.create_notification(
                user_id="attendee@example.com",
                title="Booking Cancelled",
                message=f"Booking {res.get('booking_reference')} has been cancelled. {res.get('restored_tickets')} ticket(s) restored.",
                notification_type=NotificationType.EVENT_CANCELLED,
                booking_id=res.get("booking_id")
            )
        return res
