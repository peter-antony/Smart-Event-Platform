from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field


class EventBase(BaseModel):
    title: str = Field(..., description="Event title / name", min_length=2, max_length=255)
    description: str = Field(..., description="Detailed description of event")
    category: str = Field(..., description="Event category (e.g. Technology, Music, Sports)")
    city: str = Field(..., description="City where event takes place")
    location: str = Field(..., description="Venue location or virtual link")
    venue_name: Optional[str] = Field(None, description="Venue name")
    address: Optional[str] = Field(None, description="Venue address")
    state: Optional[str] = Field(None, description="State / Region")
    event_type: str = Field("In-Person", description="Event type: In-Person or Virtual")
    status: str = Field("PUBLISHED", description="Event status: DRAFT, PUBLISHED, CANCELLED, COMPLETED")
    organizer_id: Optional[str] = Field("organizer@example.com", description="Creator organizer ID / email")
    is_virtual: bool = Field(False, description="Whether event is online/virtual")
    start_time: datetime = Field(..., description="Event start date and time")
    end_time: datetime = Field(..., description="Event end date and time")
    price: float = Field(..., ge=0.0, description="Ticket price")
    capacity: int = Field(..., gt=0, description="Maximum seating/attendee capacity")
    available_seats: int = Field(..., ge=0, description="Currently available seats")
    image_url: Optional[str] = Field(None, description="Event image cover URL")
    tags: List[str] = Field(default_factory=list, description="Associated event tags")


class EventCreate(BaseModel):
    title: Optional[str] = Field(None, description="Event title")
    name: Optional[str] = Field(None, description="Event name alias")
    event_name: Optional[str] = Field(None, description="Event name alias")
    description: str = Field(..., description="Detailed description of event")
    category: str = Field(..., description="Event category")
    city: str = Field(..., description="City location")
    location: Optional[str] = Field(None, description="Venue location")
    venue_name: Optional[str] = Field(None, description="Venue name")
    address: Optional[str] = Field(None, description="Venue address")
    state: Optional[str] = Field(None, description="State / Region")
    event_type: Optional[str] = Field("In-Person", description="Event type")
    status: Optional[str] = Field("PUBLISHED", description="Event status: DRAFT, PUBLISHED, CANCELLED, COMPLETED")
    organizer_id: Optional[str] = Field("organizer@example.com", description="Creator organizer ID / email")
    is_virtual: Optional[bool] = Field(False, description="Is virtual event")
    event_date: Optional[str] = Field(None, description="Event date string e.g. 2026-08-15")
    start_time: Optional[datetime] = Field(None, description="Start time ISO string")
    end_time: Optional[datetime] = Field(None, description="End time ISO string")
    price: Optional[float] = Field(None, ge=0.0, description="Price")
    ticket_price: Optional[float] = Field(None, ge=0.0, description="Ticket price alias")
    capacity: Optional[int] = Field(None, gt=0, description="Total tickets / capacity")
    total_tickets: Optional[int] = Field(None, gt=0, description="Total tickets alias")
    available_seats: Optional[int] = Field(None, ge=0, description="Available seats")
    image_url: Optional[str] = Field(None, description="Image URL")
    event_image: Optional[str] = Field(None, description="Event image alias")
    tags: List[str] = Field(default_factory=list, description="Tags")


class EventUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=2, max_length=255)
    description: Optional[str] = None
    category: Optional[str] = None
    city: Optional[str] = None
    location: Optional[str] = None
    venue_name: Optional[str] = None
    address: Optional[str] = None
    state: Optional[str] = None
    event_type: Optional[str] = None
    status: Optional[str] = None
    organizer_id: Optional[str] = None
    is_virtual: Optional[bool] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    price: Optional[float] = Field(None, ge=0.0)
    capacity: Optional[int] = Field(None, gt=0)
    available_seats: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    tags: Optional[List[str]] = None


class EventStatusUpdate(BaseModel):
    status: str = Field(..., description="New event status: DRAFT, PUBLISHED, CANCELLED, COMPLETED")


class EventResponse(EventBase):
    id: str
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


class EventSearchFilter(BaseModel):
    category: Optional[str] = None
    name: Optional[str] = None
    city: Optional[str] = None
    organizer_id: Optional[str] = None
    status: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    min_price: Optional[float] = None
    max_price: Optional[float] = None
    available_tickets: Optional[int] = None
