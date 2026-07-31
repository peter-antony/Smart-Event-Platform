import logging
from typing import List, Dict, Any, Optional
from app.repositories.notification_repository import NotificationRepository
from app.models.notification import NotificationType
from app.core.socket_manager import SocketManager

logger = logging.getLogger("notification_service")


class NotificationService:

    @staticmethod
    async def create_notification(
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.BOOKING_CONFIRMED,
        booking_id: Optional[str] = None,
        recipient: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Creates in-app notification record and broadcasts live update via Socket.IO.
        """
        notif = await NotificationRepository.create(
            user_id=user_id,
            title=title,
            message=message,
            notification_type=notification_type,
            booking_id=booking_id,
            recipient=recipient
        )

        # Broadcast live via SocketManager
        await SocketManager.broadcast_notification(notif)
        return notif

    @staticmethod
    async def get_user_notifications(user_id: str = "user_default") -> Dict[str, Any]:
        notifications = await NotificationRepository.get_by_user(user_id)
        unread = sum(1 for n in notifications if not n.get("is_read", False))
        return {
            "notifications": notifications,
            "unread_count": unread
        }

    @staticmethod
    async def mark_as_read(notification_id: str) -> Optional[Dict[str, Any]]:
        return await NotificationRepository.mark_as_read(notification_id)

    @staticmethod
    async def mark_all_as_read(user_id: str = "user_default") -> int:
        return await NotificationRepository.mark_all_as_read(user_id)
