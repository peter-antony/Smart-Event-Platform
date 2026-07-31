import uuid
from datetime import datetime
from sqlalchemy import Column, String, ForeignKey, DateTime
from app.models.event import GUID
from app.db.session import Base


class BookingTicket(Base):
    __tablename__ = "booking_tickets"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    booking_id = Column(GUID(), ForeignKey("bookings.id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_code = Column(String(100), unique=True, nullable=False, index=True)
    seat_number = Column(String(50), nullable=True)
    status = Column(String(50), nullable=False, default="ACTIVE")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "booking_id": str(self.booking_id),
            "ticket_code": self.ticket_code,
            "seat_number": self.seat_number,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
