import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, Float, Integer, DateTime, JSON, ForeignKey, Index
)
from sqlalchemy.types import TypeDecorator, CHAR
from sqlalchemy.dialects.postgresql import UUID as PG_UUID
from app.db.session import Base


class GUID(TypeDecorator):
    """Platform-independent GUID/UUID type."""
    impl = CHAR
    cache_ok = True

    def load_dialect_impl(self, dialect):
        if dialect.name == 'postgresql':
            return dialect.type_descriptor(PG_UUID(as_uuid=True))
        else:
            return dialect.type_descriptor(CHAR(36))

    def process_bind_param(self, value, dialect):
        if value is None:
            return value
        elif dialect.name == 'postgresql':
            return str(value)
        else:
            if not isinstance(value, uuid.UUID):
                return str(uuid.UUID(str(value)))
            return str(value)

    def process_result_value(self, value, dialect):
        if value is None:
            return value
        else:
            if not isinstance(value, uuid.UUID):
                return uuid.UUID(str(value))
            return value


class Event(Base):
    __tablename__ = "events"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    category = Column(String(100), nullable=False, index=True)
    category_id = Column(GUID(), nullable=True, index=True)
    city = Column(String(100), nullable=False, index=True)
    location = Column(String(255), nullable=False)
    venue_id = Column(GUID(), nullable=True, index=True)
    venue_name = Column(String(255), nullable=True)
    address = Column(String(255), nullable=True)
    state = Column(String(100), nullable=True)
    event_type = Column(String(50), default="In-Person", nullable=False)
    organizer_id = Column(String(100), default="organizer@example.com", nullable=False, index=True)
    status = Column(String(20), default="PUBLISHED", nullable=False, index=True)
    is_virtual = Column(Boolean, default=False, nullable=False)
    start_time = Column(DateTime, nullable=False, index=True)
    end_time = Column(DateTime, nullable=False)
    price = Column(Float, nullable=False, default=0.0)
    capacity = Column(Integer, nullable=False, default=100)
    available_seats = Column(Integer, nullable=False, default=100)
    image_url = Column(String(500), nullable=True)
    tags = Column(JSON, default=list)

    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        Index('ix_events_category_city', 'category', 'city'),
        Index('ix_events_start_price', 'start_time', 'price'),
    )

    def to_dict(self):
        return {
            "id": str(self.id),
            "title": self.title,
            "description": self.description,
            "category": self.category,
            "category_id": str(self.category_id) if self.category_id else None,
            "city": self.city,
            "location": self.location,
            "venue_name": self.venue_name,
            "address": self.address,
            "state": self.state,
            "event_type": self.event_type,
            "status": self.status,
            "organizer_id": self.organizer_id or "organizer@example.com",
            "venue_id": str(self.venue_id) if self.venue_id else None,
            "is_virtual": self.is_virtual,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "price": self.price,
            "capacity": self.capacity,
            "available_seats": self.available_seats,
            "image_url": self.image_url,
            "tags": self.tags or [],
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
