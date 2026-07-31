from typing import List, Optional
from fastapi import HTTPException, status as http_status
from app.repositories.event_repository import EventRepository
from app.schemas.event import EventCreate, EventUpdate, EventSearchFilter, EventStatusUpdate

repo = EventRepository()

ALLOWED_STATUS_TRANSITIONS = {
    "DRAFT": ["PUBLISHED"],
    "PUBLISHED": ["DRAFT", "CANCELLED", "COMPLETED"],
    "CANCELLED": [],
    "COMPLETED": []
}


class EventService:
    """
    Service Layer handling business validation, RBAC checks, status transitions, and repository coordination.
    """

    @staticmethod
    async def get_all_events(is_attendee: bool = True) -> List[dict]:
        all_events = await repo.get_all()
        if is_attendee:
            # Attendees must ONLY see PUBLISHED events
            return [e for e in all_events if e.get("status", "").upper() == "PUBLISHED"]
        return all_events

    @staticmethod
    async def get_event_by_id(event_id: str) -> Optional[dict]:
        return await repo.get_by_id(event_id)

    @staticmethod
    async def create_event(event_in: EventCreate) -> dict:
        if event_in.start_time and event_in.end_time and event_in.end_time <= event_in.start_time:
            raise ValueError("Event end_time must be after start_time")
        if event_in.available_seats is not None and event_in.capacity is not None:
            if event_in.available_seats > event_in.capacity:
                raise ValueError("Available seats cannot exceed event total capacity")

        return await repo.create(event_in)

    @staticmethod
    async def update_event(event_id: str, event_in: EventUpdate) -> Optional[dict]:
        existing = await repo.get_by_id(event_id)
        if not existing:
            return None

        # Business validations if times or capacity updated
        start = event_in.start_time or existing.get("start_time")
        end = event_in.end_time or existing.get("end_time")
        if start and end and end <= start:
            raise ValueError("Event end_time must be after start_time")

        cap = event_in.capacity if event_in.capacity is not None else existing.get("capacity", 100)
        avail = event_in.available_seats if event_in.available_seats is not None else existing.get("available_seats", 100)
        if avail and cap and avail > cap:
            raise ValueError("Available seats cannot exceed total capacity")

        return await repo.update(event_id, event_in)

    @staticmethod
    async def update_event_status(
        event_id: str,
        target_status: str,
        user_email: str,
        user_role: str
    ) -> dict:
        existing = await repo.get_by_id(event_id)
        if not existing:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID '{event_id}' not found"
            )

        # RBAC Check: Only event owner or admin can change status
        owner_id = existing.get("organizer_id", "organizer@example.com")
        if user_role != "ADMIN" and owner_id.lower() != user_email.lower():
            raise HTTPException(
                status_code=http_status.HTTP_403_FORBIDDEN,
                detail="Permission denied: Only the event owner or admin can change event status"
            )

        current_status = existing.get("status", "PUBLISHED").upper()
        target_status_upper = target_status.upper()

        if target_status_upper not in ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status '{target_status}'. Must be DRAFT, PUBLISHED, CANCELLED, or COMPLETED"
            )

        # Validate allowed transitions
        allowed = ALLOWED_STATUS_TRANSITIONS.get(current_status, [])
        if target_status_upper != current_status and target_status_upper not in allowed:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Invalid status transition from {current_status} to {target_status_upper}. Allowed transitions: {allowed}"
            )

        update_in = EventUpdate(status=target_status_upper)
        updated = await repo.update(event_id, update_in)
        return updated or existing

    @staticmethod
    async def delete_event(event_id: str) -> bool:
        return await repo.delete(event_id)

    @staticmethod
    async def search_events(filters: EventSearchFilter) -> List[dict]:
        # If attendee search (organizer_id is None and status is None), default status to PUBLISHED
        if not filters.organizer_id and not filters.status:
            filters.status = "PUBLISHED"
        return await repo.search(filters)
