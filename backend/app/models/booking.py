import uuid
from datetime import datetime
from enum import Enum as PyEnum
from sqlalchemy import (
    Column, String, Integer, Float, DateTime, Enum, ForeignKey, Index
)
from app.models.event import GUID
from app.db.session import Base


class BookingStatus(str, PyEnum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class Booking(Base):
    __tablename__ = "bookings"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_reference = Column(String(50), unique=True, nullable=False, index=True)
    event_id = Column(GUID(), ForeignKey("events.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(String(255), nullable=False, index=True)
    number_of_tickets = Column(Integer, nullable=False, default=1)
    unit_price = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    status = Column(Enum(BookingStatus), nullable=False, default=BookingStatus.CONFIRMED, index=True)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_bookings_user_status', 'user_id', 'status'),
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "booking_reference": self.booking_reference,
            "event_id": str(self.event_id),
            "user_id": self.user_id,
            "number_of_tickets": self.number_of_tickets,
            "unit_price": self.unit_price,
            "total_amount": self.total_amount,
            "status": self.status.value if isinstance(self.status, BookingStatus) else str(self.status),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
