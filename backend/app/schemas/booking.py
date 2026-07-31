from enum import Enum
from typing import Optional
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field
from app.schemas.event import EventResponse


class BookingStatus(str, Enum):
    PENDING = "PENDING"
    CONFIRMED = "CONFIRMED"
    CANCELLED = "CANCELLED"


class BookingCreate(BaseModel):
    event_id: str = Field(..., description="Event UUID to book tickets for")
    user_id: Optional[str] = Field(None, description="User ID or email address")
    attendee_id: Optional[str] = Field(None, description="Attendee ID or email alias")
    number_of_tickets: Optional[int] = Field(None, ge=1, description="Quantity of tickets")
    ticket_quantity: Optional[int] = Field(None, ge=1, description="Quantity alias")
    quantity: Optional[int] = Field(None, ge=1, description="Quantity alias")
    total_amount: Optional[float] = Field(None, ge=0.0, description="Total amount paid")


class BookingResponse(BaseModel):
    id: str
    booking_reference: str
    event_id: str
    user_id: str
    number_of_tickets: int
    unit_price: float
    total_amount: float
    status: str
    created_at: datetime
    updated_at: datetime
    event: Optional[EventResponse] = None

    model_config = ConfigDict(from_attributes=True)


class BookingCancelResponse(BaseModel):
    booking_id: str
    booking_reference: str
    status: str = "CANCELLED"
    restored_tickets: int
    message: str
