import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import Column, String, Text, Boolean, DateTime, Enum, ForeignKey
from app.models.event import GUID
from app.db.session import Base


class NotificationType(str, PyEnum):
    BOOKING_CONFIRMED = "BOOKING_CONFIRMED"
    EVENT_REMINDER = "EVENT_REMINDER"
    EVENT_UPDATED = "EVENT_UPDATED"
    EVENT_CANCELLED = "EVENT_CANCELLED"
    CALENDAR_ADDED = "CALENDAR_ADDED"


class Notification(Base):
    __tablename__ = "notifications"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(255), nullable=False, index=True)
    booking_id = Column(GUID(), ForeignKey("bookings.id", ondelete="SET NULL"), nullable=True, index=True)
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    notification_type = Column(Enum(NotificationType), nullable=False, default=NotificationType.BOOKING_CONFIRMED, index=True)
    is_read = Column(Boolean, nullable=False, default=False, index=True)
    channel = Column(String(50), nullable=False, default="in_app")
    recipient = Column(String(255), nullable=False)
    status = Column(String(50), nullable=False, default="DELIVERED")

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "user_id": self.user_id,
            "booking_id": str(self.booking_id) if self.booking_id else None,
            "title": self.title,
            "message": self.message,
            "notification_type": self.notification_type.value if isinstance(self.notification_type, NotificationType) else str(self.notification_type),
            "is_read": self.is_read,
            "channel": self.channel,
            "recipient": self.recipient,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
