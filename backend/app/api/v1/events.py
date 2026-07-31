from typing import List, Optional
from datetime import datetime
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Query, Depends, status
from app.services.event_service import EventService
from app.schemas.event import EventResponse, EventCreate, EventUpdate, EventSearchFilter, EventStatusUpdate
from app.core.auth_deps import get_current_user, require_role

router = APIRouter()


@router.get("/published", response_model=List[EventResponse], summary="GET /api/events/published - List published events for attendees")
async def get_published_events(
    category: Optional[str] = Query(None, description="Event category filter"),
    name: Optional[str] = Query(None, description="Event title or keyword search"),
    city: Optional[str] = Query(None, description="City location filter"),
    start_date: Optional[datetime] = Query(None, description="Filter events starting on or after ISO datetime"),
    end_date: Optional[datetime] = Query(None, description="Filter events ending on or before ISO datetime"),
    min_price: Optional[float] = Query(None, ge=0.0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0.0, description="Maximum budget price filter")
):
    """
    Retrieve ONLY published events for attendee discovery.
    Draft, cancelled, or completed events are strictly excluded.
    """
    filters = EventSearchFilter(
        category=category,
        name=name,
        city=city,
        status="PUBLISHED",
        start_date=start_date,
        end_date=end_date,
        min_price=min_price,
        max_price=max_price
    )
    return await EventService.search_events(filters)


@router.get("/search", response_model=List[EventResponse], summary="GET /api/events/search - Multi-criteria event search")
async def search_events(
    category: Optional[str] = Query(None, description="Event category filter"),
    name: Optional[str] = Query(None, description="Event title or keyword search"),
    city: Optional[str] = Query(None, description="City location filter"),
    organizer_id: Optional[str] = Query(None, description="Filter by creator organizer ID / email"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by event status (DRAFT, PUBLISHED, CANCELLED, COMPLETED)"),
    start_date: Optional[datetime] = Query(None, description="Filter events starting on or after ISO datetime"),
    end_date: Optional[datetime] = Query(None, description="Filter events ending on or before ISO datetime"),
    min_price: Optional[float] = Query(None, ge=0.0, description="Minimum price filter"),
    max_price: Optional[float] = Query(None, ge=0.0, description="Maximum budget price filter"),
    available_tickets: Optional[int] = Query(None, ge=0, description="Minimum available ticket count filter")
):
    """
    Search events with filtering by category, event name keyword, city, organizer_id, status, date range, min/max price, and ticket availability.
    """
    filters = EventSearchFilter(
        category=category,
        name=name,
        city=city,
        organizer_id=organizer_id,
        status=status_filter,
        start_date=start_date,
        end_date=end_date,
        min_price=min_price,
        max_price=max_price,
        available_tickets=available_tickets
    )
    return await EventService.search_events(filters)


@router.get("", response_model=List[EventResponse], summary="GET /api/events - List events")
async def get_all_events(
    category: Optional[str] = Query(None, description="Filter by category"),
    city: Optional[str] = Query(None, description="Filter by city"),
    organizer_id: Optional[str] = Query(None, description="Filter by creator organizer ID / email"),
    status_filter: Optional[str] = Query(None, alias="status", description="Filter by event status")
):
    """Retrieve list of events with optional filtering by category, city, organizer_id, and status."""
    if organizer_id or status_filter or category or city:
        filters = EventSearchFilter(
            category=category,
            city=city,
            organizer_id=organizer_id,
            status=status_filter
        )
        return await EventService.search_events(filters)
    return await EventService.get_all_events()


@router.get("/{event_id}", response_model=EventResponse, summary="GET /api/events/{eventId} - Get event by ID")
async def get_event_by_id(event_id: str):
    """Retrieve detailed event information by Event UUID."""
    event = await EventService.get_event_by_id(event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )
    return event


@router.post("", response_model=EventResponse, status_code=status.HTTP_201_CREATED, summary="POST /api/events - Create new event")
async def create_event(
    event_in: EventCreate,
    current_user: dict = Depends(require_role(["ORGANIZER", "ADMIN", "ATTENDEE"]))
):
    """
    Create a new event.
    RBAC Permission: Requires ORGANIZER, ADMIN, or ATTENDEE role.
    """
    return await EventService.create_event(event_in)


@router.put("/{event_id}", response_model=EventResponse, summary="PUT /api/events/{eventId} - Update event")
async def update_event(
    event_id: str,
    event_in: EventUpdate,
    current_user: dict = Depends(require_role(["ORGANIZER", "ADMIN", "ATTENDEE"]))
):
    """
    Update an existing event.
    RBAC Permission: Requires ORGANIZER, ADMIN, or ATTENDEE role.
    """
    updated_event = await EventService.update_event(event_id, event_in)
    if not updated_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found for update"
        )
    return updated_event


@router.patch("/{event_id}/status", response_model=EventResponse, summary="PATCH /api/events/{eventId}/status - Update event status")
async def update_event_status(
    event_id: str,
    status_in: EventStatusUpdate,
    current_user: dict = Depends(get_current_user)
):
    """
    Change event status (DRAFT -> PUBLISHED, PUBLISHED -> DRAFT, PUBLISHED -> CANCELLED, PUBLISHED -> COMPLETED).
    RBAC Permission: Requires Event Owner or ADMIN.
    """
    user_email = current_user.get("email", "organizer@example.com")
    user_role = current_user.get("role", "ORGANIZER")
    return await EventService.update_event_status(event_id, status_in.status, user_email, user_role)


@router.delete("/{event_id}", summary="DELETE /api/events/{eventId} - Delete event")
async def delete_event(
    event_id: str,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """
    Delete an event.
    RBAC Permission: Requires ADMIN role.
    """
    deleted = await EventService.delete_event(event_id)
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found for deletion"
        )
    return {"message": f"Event '{event_id}' successfully deleted", "id": event_id}
