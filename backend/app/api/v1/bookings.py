from typing import List, Optional
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Query, status
from app.services.booking_service import BookingService
from app.schemas.booking import BookingCreate, BookingResponse, BookingCancelResponse

router = APIRouter()


@router.post("", response_model=BookingResponse, status_code=status.HTTP_201_CREATED, summary="POST /api/bookings - Create new ticket booking")
async def create_booking(booking_in: BookingCreate):
    """
    Create a new ticket booking for an event.
    Validation steps performed:
    1. Validate event exists (HTTP 404 if missing)
    2. Validate ticket quantity (number_of_tickets > 0)
    3. Check real-time ticket availability (available_seats >= tickets)
    4. Calculate total amount
    5. Deduct seats from event inventory
    6. Generate unique booking reference code (e.g. BK-8A2F9C1B)
    7. Return booking confirmation
    """
    try:
        booking = await BookingService.create_booking(booking_in)
        return booking
    except ValueError as err:
        err_msg = str(err)
        if "not found" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=err_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )


@router.get("/my", response_model=List[BookingResponse], summary="GET /api/bookings/my - List attendee's registered bookings")
async def get_my_bookings(
    user_id: Optional[str] = Query("attendee@example.com", description="Attendee user ID or email")
):
    """
    Retrieve list of bookings registered to the attendee.
    """
    return await BookingService.get_all_bookings(user_id=user_id)


@router.get("", response_model=List[BookingResponse], summary="GET /api/bookings - List all bookings")
async def list_bookings(
    user_id: Optional[str] = Query(None, description="Optional filter by user ID or user email")
):
    """
    Retrieve all bookings in system, with optional filtering by user_id.
    """
    bookings = await BookingService.get_all_bookings(user_id=user_id)
    return bookings


@router.get("/{booking_id}", response_model=BookingResponse, summary="GET /api/bookings/{bookingId} - Get booking by UUID or Reference")
async def get_booking(booking_id: str):
    """
    Get detailed information for a specific booking by UUID or reference code (e.g. BK-8A2F9C1B).
    """
    booking = await BookingService.get_booking_by_id(booking_id)
    if not booking:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Booking with ID/Reference '{booking_id}' not found"
        )
    return booking


@router.post("/{booking_id}/cancel", response_model=BookingCancelResponse, summary="POST /api/bookings/{bookingId}/cancel - Cancel booking")
async def cancel_booking(booking_id: str):
    """
    Cancel an existing booking, transition status to CANCELLED, and restore tickets to event capacity.
    """
    try:
        result = await BookingService.cancel_booking(booking_id)
        return result
    except ValueError as err:
        err_msg = str(err)
        if "not found" in err_msg.lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=err_msg
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=err_msg
        )
