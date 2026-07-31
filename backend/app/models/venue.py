import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime
from app.models.event import GUID
from app.db.session import Base


class Venue(Base):
    __tablename__ = "venues"

    id = Column(GUID(), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String(255), nullable=False)
    city = Column(String(100), nullable=False, index=True)
    address = Column(String(255), nullable=False)
    capacity = Column(Integer, nullable=False, default=500)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    def to_dict(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "city": self.city,
            "address": self.address,
            "capacity": self.capacity,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
