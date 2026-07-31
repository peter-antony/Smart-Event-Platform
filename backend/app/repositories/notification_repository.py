import uuid
import logging
from typing import List, Optional, Dict, Any
from datetime import datetime
from app.models.notification import Notification, NotificationType

logger = logging.getLogger("notification_repository")

# In-memory fallback repository when DB session is not active
_in_memory_notifications: List[Dict[str, Any]] = [
    {
        "id": "notif-seed-1",
        "user_id": "user@example.com",
        "booking_id": "bkg-123",
        "title": "Booking Confirmed!",
        "message": "Your ticket pass for Acoustic Harmony Music Concert has been confirmed.",
        "notification_type": "BOOKING_CONFIRMED",
        "is_read": False,
        "channel": "in_app",
        "recipient": "user@example.com",
        "status": "DELIVERED",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat()
    }
]


class NotificationRepository:

    @staticmethod
    async def create(
        user_id: str,
        title: str,
        message: str,
        notification_type: NotificationType = NotificationType.BOOKING_CONFIRMED,
        booking_id: Optional[str] = None,
        recipient: Optional[str] = None
    ) -> Dict[str, Any]:
        notif_id = str(uuid.uuid4())
        record = {
            "id": notif_id,
            "user_id": user_id,
            "booking_id": booking_id,
            "title": title,
            "message": message,
            "notification_type": notification_type.value if isinstance(notification_type, NotificationType) else str(notification_type),
            "is_read": False,
            "channel": "in_app",
            "recipient": recipient or user_id,
            "status": "DELIVERED",
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        _in_memory_notifications.insert(0, record)
        logger.info(f"[NotificationRepo] Created notification: '{title}' for user '{user_id}'")
        return record

    @staticmethod
    async def get_by_user(user_id: str = "user_default") -> List[Dict[str, Any]]:
        # Return user notifications
        return [n for n in _in_memory_notifications if n["user_id"] in [user_id, "user_default", "user@example.com"]]

    @staticmethod
    async def mark_as_read(notification_id: str) -> Optional[Dict[str, Any]]:
        for n in _in_memory_notifications:
            if n["id"] == notification_id:
                n["is_read"] = True
                n["updated_at"] = datetime.utcnow().isoformat()
                return n
        return None

    @staticmethod
    async def mark_all_as_read(user_id: str = "user_default") -> int:
        count = 0
        for n in _in_memory_notifications:
            if n["user_id"] in [user_id, "user_default", "user@example.com"] and not n["is_read"]:
                n["is_read"] = True
                count += 1
        return count
