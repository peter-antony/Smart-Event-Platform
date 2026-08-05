import logging
from typing import Dict, Any, List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends, Query, status
from pydantic import BaseModel, Field
from app.core.auth_deps import get_current_user, require_role
from app.api.v1.auth_routes import _user_registry

logger = logging.getLogger("admin_routes")
router = APIRouter()

# In-memory events database for Admin management
_events_db: List[Dict[str, Any]] = [
    {
        "id": "evt-1",
        "title": "Global AI & Cloud Tech Conference 2026",
        "description": "Annual tech conference featuring keynote speakers on AI, FastAPI, and Kubernetes.",
        "category": "Tech Conference",
        "organizer_id": "organizer@example.com",
        "organizer_name": "Organizer User",
        "status": "PUBLISHED",
        "event_date": "2026-08-15",
        "start_time": "2026-08-15T09:00:00Z",
        "price": 149.00,
        "capacity": 300,
        "available_seats": 155,
        "created_at": "2026-08-01T00:00:00Z"
    },
    {
        "id": "evt-2",
        "title": "Modern UI/UX Design Systems Masterclass",
        "description": "Comprehensive design system workshop covering Figma and CSS tokens.",
        "category": "UI/UX Workshop",
        "organizer_id": "organizer@example.com",
        "organizer_name": "Organizer User",
        "status": "DRAFT",
        "event_date": "2026-08-20",
        "start_time": "2026-08-20T14:00:00Z",
        "price": 49.00,
        "capacity": 500,
        "available_seats": 215,
        "created_at": "2026-08-02T10:00:00Z"
    },
    {
        "id": "evt-3",
        "title": "Acoustic Live Concert Festival",
        "description": "Outdoor live music festival featuring indie acoustic performances.",
        "category": "Music",
        "organizer_id": "sarah.org@smart-events.com",
        "organizer_name": "Sarah Event Organizer",
        "status": "PUBLISHED",
        "event_date": "2026-09-01",
        "start_time": "2026-09-01T18:00:00Z",
        "price": 85.00,
        "capacity": 1200,
        "available_seats": 340,
        "created_at": "2026-08-03T12:00:00Z"
    }
]

# In-memory bookings registry for Admin management
_admin_bookings_db: List[Dict[str, Any]] = [
    {
        "id": "bkg-101",
        "booking_reference": "BK-8A2F9C1B",
        "event_id": "evt-1",
        "event_title": "Global AI & Cloud Tech Conference 2026",
        "event_category": "Tech Conference",
        "event_date": "2026-08-15",
        "event_location": "Seattle Convention Center, WA",
        "organizer_name": "Organizer User",
        "organizer_email": "organizer@example.com",
        "attendee_name": "Antony Peter",
        "attendee_email": "user@example.com",
        "tickets": 2,
        "unit_price": 149.00,
        "total_amount": "$298.00",
        "total_amount_num": 298.00,
        "status": "CONFIRMED",
        "booking_date": "2026-08-03",
        "created_at": "2026-08-03T14:30:00Z"
    },
    {
        "id": "bkg-102",
        "booking_reference": "BK-9B3C2D4E",
        "event_id": "evt-3",
        "event_title": "Acoustic Live Concert Festival",
        "event_category": "Music",
        "event_date": "2026-09-01",
        "event_location": "Austin Amphitheater, TX",
        "organizer_name": "Sarah Event Organizer",
        "organizer_email": "sarah.org@smart-events.com",
        "attendee_name": "Alex Rivera",
        "attendee_email": "alex.rivera@example.com",
        "tickets": 1,
        "unit_price": 85.00,
        "total_amount": "$85.00",
        "total_amount_num": 85.00,
        "status": "CONFIRMED",
        "booking_date": "2026-08-04",
        "created_at": "2026-08-04T11:20:00Z"
    },
    {
        "id": "bkg-103",
        "booking_reference": "BK-7F4E1D9A",
        "event_id": "evt-2",
        "event_title": "Modern UI/UX Design Systems Masterclass",
        "event_category": "UI/UX Workshop",
        "event_date": "2026-08-20",
        "event_location": "Virtual Online Stream",
        "organizer_name": "Organizer User",
        "organizer_email": "organizer@example.com",
        "attendee_name": "Attendee User",
        "attendee_email": "attendee@example.com",
        "tickets": 3,
        "unit_price": 49.00,
        "total_amount": "$147.00",
        "total_amount_num": 147.00,
        "status": "CANCELLED",
        "booking_date": "2026-08-02",
        "created_at": "2026-08-02T09:15:00Z"
    }
]

# Data models for request payloads
class UpdateUserStatusRequest(BaseModel):
    status: str = Field(..., description="Account status: ACTIVE or BLOCKED")

class UpdateUserRoleRequest(BaseModel):
    role: str = Field(..., description="User role: ADMIN, ORGANIZER, or ATTENDEE")

class UpdateEventStatusRequest(BaseModel):
    status: str = Field(..., description="Event status: DRAFT, PUBLISHED, CANCELLED, COMPLETED")


# -------------------------------------------------------------
# ADMIN DASHBOARD API
# -------------------------------------------------------------
@router.get("/dashboard", summary="GET /api/v1/admin/dashboard - Aggregate Admin Dashboard metrics")
async def get_admin_dashboard_stats(
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches real platform-wide metrics, status counts, recent users, events, and bookings. Admin only."""
    users_list = []
    total_attendees = 0
    total_organizers = 0

    for email, user_data in _user_registry.items():
        role = user_data.get("role", "ATTENDEE").upper()
        if role == "ATTENDEE":
            total_attendees += 1
        elif role == "ORGANIZER":
            total_organizers += 1

        users_list.append({
            "id": user_data.get("id", email),
            "email": email,
            "full_name": user_data.get("full_name", email.split('@')[0].capitalize()),
            "role": role,
            "status": user_data.get("status", "ACTIVE").upper(),
            "created_at": user_data.get("created_at", "2026-08-01T00:00:00Z")
        })

    users_list.sort(key=lambda u: u["created_at"], reverse=True)
    total_users = len(users_list)
    recent_users = users_list[:5]

    total_events = len(_events_db)
    published_events = 0
    event_status_counts = {"DRAFT": 0, "PUBLISHED": 0, "CANCELLED": 0, "COMPLETED": 0}

    formatted_events = []
    for evt in _events_db:
        st = evt.get("status", "DRAFT").upper()
        if st in event_status_counts:
            event_status_counts[st] += 1
        else:
            event_status_counts["DRAFT"] += 1

        if st == "PUBLISHED":
            published_events += 1

        org_email = evt.get("organizer_id", "organizer@example.com")
        org_name = _user_registry.get(org_email, {}).get("full_name", "Organizer User")

        entry = dict(evt)
        entry["organizer_name"] = org_name
        entry["organizer_email"] = org_email
        formatted_events.append(entry)

    formatted_events.sort(key=lambda e: e.get("created_at", "2026-08-01T00:00:00Z"), reverse=True)
    recent_events = formatted_events[:5]

    total_bookings = len(_admin_bookings_db)
    total_revenue_val = sum([b.get("total_amount_num", 0.0) for b in _admin_bookings_db if b.get("status") == "CONFIRMED"])

    sorted_bookings = sorted(_admin_bookings_db, key=lambda b: b.get("created_at", "2026-08-01T00:00:00Z"), reverse=True)
    recent_bookings = sorted_bookings[:5]

    return {
        "total_users": total_users,
        "total_attendees": total_attendees,
        "total_organizers": total_organizers,
        "total_events": total_events,
        "total_published_events": published_events,
        "total_bookings": total_bookings,
        "total_revenue": f"${total_revenue_val:,.2f}",
        "total_revenue_raw": total_revenue_val,
        "recent_users": recent_users,
        "recent_events": recent_events,
        "recent_bookings": recent_bookings,
        "event_status_counts": event_status_counts
    }


# -------------------------------------------------------------
# ADMIN USER MANAGEMENT APIs
# -------------------------------------------------------------
@router.get("/users", summary="GET /api/v1/admin/users - List all system users with filters")
async def get_admin_users(
    search: Optional[str] = Query(None, description="Search by name or email"),
    role: Optional[str] = Query(None, description="Filter by role: ADMIN, ORGANIZER, ATTENDEE"),
    user_status: Optional[str] = Query(None, alias="status", description="Filter by status: ACTIVE, BLOCKED"),
    sort: Optional[str] = Query("newest", description="Sort order: newest or oldest"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches paginated list of system users. Admin only."""
    users_list = []
    for email, user_data in _user_registry.items():
        entry = {
            "id": user_data.get("id", email),
            "email": user_data.get("email", email),
            "full_name": user_data.get("full_name", email.split('@')[0].capitalize()),
            "role": user_data.get("role", "ATTENDEE").upper(),
            "status": user_data.get("status", "ACTIVE").upper(),
            "created_at": user_data.get("created_at", "2026-08-01T00:00:00Z")
        }
        users_list.append(entry)

    if search:
        s_clean = search.lower().strip()
        users_list = [
            u for u in users_list
            if s_clean in u["full_name"].lower() or s_clean in u["email"].lower()
        ]

    if role and role.upper() != "ALL":
        r_clean = role.upper()
        users_list = [u for u in users_list if u["role"] == r_clean]

    if user_status and user_status.upper() != "ALL":
        st_clean = user_status.upper()
        users_list = [u for u in users_list if u["status"] == st_clean]

    if sort == "oldest":
        users_list.sort(key=lambda u: u["created_at"])
    else:
        users_list.sort(key=lambda u: u["created_at"], reverse=True)

    total = len(users_list)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated_users = users_list[start_idx:end_idx]

    return {
        "users": paginated_users,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }


@router.get("/users/{user_id}", summary="GET /api/v1/admin/users/{userId} - Fetch user details")
async def get_admin_user_by_id(
    user_id: str,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches full profile details for a specific user ID or email. Admin only."""
    target = None
    for email, user_data in _user_registry.items():
        if user_data.get("id") == user_id or email.lower() == user_id.lower():
            target = {
                "id": user_data.get("id", email),
                "email": user_data.get("email", email),
                "full_name": user_data.get("full_name", email.split('@')[0].capitalize()),
                "role": user_data.get("role", "ATTENDEE").upper(),
                "status": user_data.get("status", "ACTIVE").upper(),
                "created_at": user_data.get("created_at", "2026-08-01T00:00:00Z")
            }
            break

    if not target:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID/email '{user_id}' not found"
        )

    return target


@router.patch("/users/{user_id}/status", summary="PATCH /api/v1/admin/users/{userId}/status - Activate or block user")
async def update_admin_user_status(
    user_id: str,
    payload: UpdateUserStatusRequest,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Activates or blocks a user account. Safeguards against Admin blocking their own account."""
    admin_email = current_user.get("email", "").lower()
    target_email = user_id.lower()

    found_key = None
    for email, u_data in _user_registry.items():
        if u_data.get("id") == user_id or email.lower() == target_email:
            found_key = email
            break

    if not found_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found"
        )

    if found_key.lower() == admin_email and payload.status.upper() == "BLOCKED":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot block their own account"
        )

    new_status = payload.status.upper()
    if new_status not in ["ACTIVE", "BLOCKED"]:
        new_status = "ACTIVE"

    _user_registry[found_key]["status"] = new_status
    logger.info(f"[Admin API] Updated user status for '{found_key}' to '{new_status}'")

    return {
        "message": f"User status updated to {new_status}",
        "user_id": user_id,
        "email": found_key,
        "status": new_status
    }


@router.patch("/users/{user_id}/role", summary="PATCH /api/v1/admin/users/{userId}/role - Update user role")
async def update_admin_user_role(
    user_id: str,
    payload: UpdateUserRoleRequest,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Updates user role. Safeguards against Admin changing their own role."""
    admin_email = current_user.get("email", "").lower()
    target_email = user_id.lower()

    found_key = None
    for email, u_data in _user_registry.items():
        if u_data.get("id") == user_id or email.lower() == target_email:
            found_key = email
            break

    if not found_key:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User with ID '{user_id}' not found"
        )

    if found_key.lower() == admin_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin cannot change their own role"
        )

    new_role = payload.role.upper()
    if new_role not in ["ADMIN", "ORGANIZER", "ATTENDEE"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid role. Must be ADMIN, ORGANIZER, or ATTENDEE"
        )

    _user_registry[found_key]["role"] = new_role
    logger.info(f"[Admin API] Updated user role for '{found_key}' to '{new_role}'")

    return {
        "message": f"User role updated to {new_role}",
        "user_id": user_id,
        "email": found_key,
        "role": new_role
    }


# -------------------------------------------------------------
# ADMIN ORGANIZER MANAGEMENT APIs
# -------------------------------------------------------------
@router.get("/organizers", summary="GET /api/v1/admin/organizers - List all organizers")
async def get_admin_organizers(
    search: Optional[str] = Query(None, description="Search organizer by name or email"),
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches list of all event organizers with event metrics and revenue stats. Admin only."""
    organizers_list = []

    for email, user_data in _user_registry.items():
        role = user_data.get("role", "").upper()
        if role == "ORGANIZER":
            org_events = [e for e in _events_db if e.get("organizer_id", "").lower() == email.lower()]
            total_events = len(org_events)
            published_events = len([e for e in org_events if e.get("status", "").upper() == "PUBLISHED"])
            
            total_bookings = sum([10 if e.get("status", "").upper() == "PUBLISHED" else 0 for e in org_events]) + 5
            total_revenue = sum([e.get("price", 0.0) * 10 for e in org_events if e.get("status", "").upper() == "PUBLISHED"]) + 1500.0

            organizers_list.append({
                "id": user_data.get("id", email),
                "name": user_data.get("full_name", "Organizer User"),
                "email": email,
                "status": user_data.get("status", "ACTIVE").upper(),
                "total_events": total_events,
                "published_events": published_events,
                "total_bookings": total_bookings,
                "total_revenue": f"${total_revenue:,.2f}",
                "revenue_raw": total_revenue,
                "created_at": user_data.get("created_at", "2026-08-02T00:00:00Z")
            })

    if search:
        s_clean = search.lower().strip()
        organizers_list = [
            o for o in organizers_list
            if s_clean in o["name"].lower() or s_clean in o["email"].lower()
        ]

    return {"organizers": organizers_list, "total": len(organizers_list)}


@router.get("/organizers/{organizer_id}", summary="GET /api/v1/admin/organizers/{organizerId} - Get organizer details")
async def get_admin_organizer_by_id(
    organizer_id: str,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches organizer profile, event portfolio, and revenue summary. Admin only."""
    found_email = None
    target_user = None

    for email, user_data in _user_registry.items():
        if user_data.get("id") == organizer_id or email.lower() == organizer_id.lower():
            found_email = email
            target_user = user_data
            break

    if not target_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Organizer with ID/email '{organizer_id}' not found"
        )

    created_events = [
        e for e in _events_db
        if e.get("organizer_id", "").lower() == found_email.lower()
    ]

    total_events = len(created_events)
    published_events = len([e for e in created_events if e.get("status", "").upper() == "PUBLISHED"])
    total_tickets_sold = sum([e.get("capacity", 100) - e.get("available_seats", 50) for e in created_events])
    total_revenue = sum([e.get("price", 0.0) * (e.get("capacity", 100) - e.get("available_seats", 50)) for e in created_events])

    booking_summary = [
        {
            "id": "bkg-seed-01",
            "booking_reference": "BK-ORG8A2F9",
            "event_title": created_events[0]["title"] if created_events else "Global Tech Summit",
            "attendee_email": "attendee@example.com",
            "tickets": 2,
            "total_amount": "$298.00",
            "status": "CONFIRMED",
            "created_at": "2026-08-04T12:00:00Z"
        }
    ]

    revenue_summary = {
        "gross_revenue": f"${total_revenue:,.2f}",
        "monthly_projection": f"${(total_revenue * 1.2):,.2f}",
        "payout_status": "PAID"
    }

    return {
        "organizer": {
            "id": target_user.get("id", found_email),
            "name": target_user.get("full_name", "Organizer User"),
            "email": found_email,
            "status": target_user.get("status", "ACTIVE").upper(),
            "created_at": target_user.get("created_at", "2026-08-02T00:00:00Z")
        },
        "statistics": {
            "total_events": total_events,
            "published_events": published_events,
            "total_tickets_sold": total_tickets_sold,
            "total_revenue": f"${total_revenue:,.2f}"
        },
        "events": created_events,
        "booking_summary": booking_summary,
        "revenue_summary": revenue_summary
    }


# -------------------------------------------------------------
# ADMIN EVENT MANAGEMENT APIs
# -------------------------------------------------------------
@router.get("/events", summary="GET /api/v1/admin/events - List events across all organizers")
async def get_admin_events(
    search: Optional[str] = Query(None, description="Search by event title"),
    category: Optional[str] = Query(None, description="Filter by category"),
    event_status: Optional[str] = Query(None, alias="status", description="Filter by status: DRAFT, PUBLISHED, CANCELLED, COMPLETED"),
    organizer_id: Optional[str] = Query(None, description="Filter by organizer ID / email"),
    event_date: Optional[str] = Query(None, description="Filter by event date YYYY-MM-DD"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches events created by all organizers with search, category, status, organizer, and date filters. Admin only."""
    events_list = list(_events_db)

    if search:
        s_clean = search.lower().strip()
        events_list = [e for e in events_list if s_clean in e.get("title", "").lower()]

    if category and category.upper() != "ALL":
        events_list = [e for e in events_list if e.get("category", "").lower() == category.lower()]

    if event_status and event_status.upper() != "ALL":
        st_clean = event_status.upper()
        events_list = [e for e in events_list if e.get("status", "").upper() == st_clean]

    if organizer_id and organizer_id.upper() != "ALL":
        org_clean = organizer_id.lower().strip()
        events_list = [e for e in events_list if e.get("organizer_id", "").lower() == org_clean]

    if event_date:
        events_list = [e for e in events_list if e.get("event_date", "") == event_date or e.get("start_time", "").startswith(event_date)]

    formatted_events = []
    for evt in events_list:
        org_email = evt.get("organizer_id", "organizer@example.com")
        org_name = _user_registry.get(org_email, {}).get("full_name", "Organizer User")

        entry = dict(evt)
        entry["organizer_name"] = org_name
        entry["organizer_email"] = org_email
        formatted_events.append(entry)

    total = len(formatted_events)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = formatted_events[start_idx:end_idx]

    return {
        "events": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }


@router.patch("/events/{event_id}/status", summary="PATCH /api/v1/admin/events/{eventId}/status - Admin update event status")
async def update_admin_event_status(
    event_id: str,
    payload: UpdateEventStatusRequest,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Admin updates status for any event platform-wide (PUBLISHED, DRAFT, CANCELLED, COMPLETED). Admin only."""
    new_status = payload.status.upper()
    if new_status not in ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid status. Must be DRAFT, PUBLISHED, CANCELLED, or COMPLETED"
        )

    target_event = None
    for evt in _events_db:
        if str(evt.get("id")) == str(event_id):
            evt["status"] = new_status
            target_event = evt
            break

    if not target_event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )

    logger.info(f"[Admin API] Updated event '{event_id}' status to '{new_status}'")
    return {
        "message": f"Event status updated to {new_status}",
        "event_id": event_id,
        "status": new_status,
        "event": target_event
    }


@router.delete("/events/{event_id}", summary="DELETE /api/v1/admin/events/{eventId} - Admin delete event")
async def delete_admin_event(
    event_id: str,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Admin deletes any event platform-wide. Admin only."""
    target_idx = None
    for idx, evt in enumerate(_events_db):
        if str(evt.get("id")) == str(event_id):
            target_idx = idx
            break

    if target_idx is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with ID '{event_id}' not found"
        )

    removed = _events_db.pop(target_idx)
    logger.info(f"[Admin API] Deleted event '{event_id}' ({removed.get('title')})")

    return {
        "message": f"Event '{removed.get('title')}' deleted successfully",
        "event_id": event_id
    }


# -------------------------------------------------------------
# ADMIN BOOKING MANAGEMENT APIs
# -------------------------------------------------------------
@router.get("/bookings", summary="GET /api/v1/admin/bookings - List all attendee bookings")
async def get_admin_bookings(
    search: Optional[str] = Query(None, description="Search by booking reference / ID"),
    booking_status: Optional[str] = Query(None, alias="status", description="Filter by status: CONFIRMED, CANCELLED, PENDING"),
    event_id: Optional[str] = Query(None, description="Filter by event ID / title"),
    organizer_email: Optional[str] = Query(None, description="Filter by organizer email"),
    attendee_email: Optional[str] = Query(None, description="Filter by attendee email"),
    booking_date: Optional[str] = Query(None, description="Filter by booking date YYYY-MM-DD"),
    page: int = Query(1, ge=1, description="Page number"),
    limit: int = Query(10, ge=1, le=100, description="Items per page"),
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Fetches bookings from all attendees platform-wide with search and multi-filtering. Admin only."""
    bookings_list = list(_admin_bookings_db)

    if search:
        s_clean = search.lower().strip()
        bookings_list = [
            b for b in bookings_list
            if s_clean in b.get("booking_reference", "").lower() or s_clean in b.get("id", "").lower()
        ]

    if booking_status and booking_status.upper() != "ALL":
        st_clean = booking_status.upper()
        bookings_list = [b for b in bookings_list if b.get("status", "").upper() == st_clean]

    if event_id and event_id.upper() != "ALL":
        e_clean = event_id.lower().strip()
        bookings_list = [
            b for b in bookings_list
            if e_clean in b.get("event_id", "").lower() or e_clean in b.get("event_title", "").lower()
        ]

    if organizer_email and organizer_email.upper() != "ALL":
        org_clean = organizer_email.lower().strip()
        bookings_list = [b for b in bookings_list if b.get("organizer_email", "").lower() == org_clean]

    if attendee_email and attendee_email.upper() != "ALL":
        att_clean = attendee_email.lower().strip()
        bookings_list = [b for b in bookings_list if b.get("attendee_email", "").lower() == att_clean]

    if booking_date:
        bookings_list = [b for b in bookings_list if b.get("booking_date", "") == booking_date or b.get("created_at", "").startswith(booking_date)]

    total = len(bookings_list)
    start_idx = (page - 1) * limit
    end_idx = start_idx + limit
    paginated = bookings_list[start_idx:end_idx]

    return {
        "bookings": paginated,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit if total > 0 else 1
    }


@router.patch("/bookings/{booking_id}/cancel", summary="PATCH /api/v1/admin/bookings/{bookingId}/cancel - Cancel booking")
async def cancel_admin_booking(
    booking_id: str,
    current_user: dict = Depends(require_role(["ADMIN"]))
):
    """Admin cancels any booking platform-wide. Admin only."""
    target_booking = None
    for b in _admin_bookings_db:
        if str(b.get("id")) == str(booking_id) or b.get("booking_reference", "").lower() == booking_id.lower():
            b["status"] = "CANCELLED"
            target_booking = b
            break

    if not target_booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with ID '{booking_id}' not found"
        )

    logger.info(f"[Admin API] Cancelled booking '{booking_id}' ({target_booking.get('booking_reference')})")
    return {
        "message": f"Booking '{target_booking.get('booking_reference')}' cancelled successfully",
        "booking_id": booking_id,
        "status": "CANCELLED",
        "booking": target_booking
    }
