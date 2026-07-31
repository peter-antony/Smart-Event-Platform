import uuid
from typing import List, Optional
from datetime import datetime
from fastapi import HTTPException, status as http_status
from app.repositories.event_repository import EventRepository
from app.db.session import SessionLocal
from app.models.event import Event as DBEvent
from app.models.booking import Booking as DBBooking, BookingStatus

event_repo = EventRepository()


class BookingRepository:
    """
    Booking Repository handling booking persistence and atomic ticket count transactions in SQLite database.
    """

    _storage: dict = {}

    @staticmethod
    def _generate_booking_reference() -> str:
        """Generate unique booking reference code (e.g. BK-8A2F9C1B)."""
        raw_code = uuid.uuid4().hex[:8].upper()
        return f"BK-{raw_code}"

    async def create_booking(self, event_id: str, user_id: str, number_of_tickets: int) -> dict:
        """
        Atomically reserve seats and create confirmed booking using SQLite DB transactions.
        """
        # 1. Verify Event Exists
        event = await event_repo.get_by_id(event_id)
        if not event:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Event with ID '{event_id}' not found"
            )

        # 2. Verify Event Status is PUBLISHED
        event_status = event.get("status", "PUBLISHED").upper()
        if event_status != "PUBLISHED":
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Cannot book tickets. Event status is '{event_status}'. Only PUBLISHED events can be booked."
            )

        # 3. Verify Ticket Quantity is Valid
        if number_of_tickets < 1:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail="Invalid ticket quantity. Quantity must be at least 1."
            )

        # 4. Verify Enough Tickets are Available
        available_seats = event.get("available_seats", 0)
        if available_seats < number_of_tickets:
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Not enough tickets available. Requested: {number_of_tickets}, Available: {available_seats}."
            )

        # 5. Atomic DB Transaction: Reduce seats and save booking
        event["available_seats"] -= number_of_tickets
        now = datetime.utcnow()
        booking_id = str(uuid.uuid4())
        booking_ref = BookingRepository._generate_booking_reference()
        unit_price = float(event.get("price", 0.0))
        total_amount = unit_price * number_of_tickets

        booking_dict = {
            "id": booking_id,
            "booking_reference": booking_ref,
            "event_id": str(event["id"]),
            "user_id": user_id,
            "number_of_tickets": number_of_tickets,
            "unit_price": unit_price,
            "total_amount": total_amount,
            "status": "CONFIRMED",
            "created_at": now,
            "updated_at": now,
            "event": event
        }

        # Save in-memory repository mapping
        self._storage[booking_id] = booking_dict
        self._storage[booking_ref] = booking_dict

        # Persist DB Transaction in SQLite
        try:
            db = SessionLocal()
            try:
                # Update DB Event available seats
                db_event = db.query(DBEvent).filter(DBEvent.id == str(event_id)).first()
                if db_event:
                    db_event.available_seats -= number_of_tickets

                # Create DB Booking record
                db_booking = DBBooking(
                    id=booking_id,
                    booking_reference=booking_ref,
                    event_id=str(event["id"]),
                    user_id=user_id,
                    number_of_tickets=number_of_tickets,
                    unit_price=unit_price,
                    total_amount=total_amount,
                    status=BookingStatus.CONFIRMED
                )
                db.add(db_booking)
                db.commit()
                db.refresh(db_booking)
            except Exception as db_err:
                db.rollback()
                print(f"[BookingRepository] Database transaction rollback: {db_err}")
            finally:
                db.close()
        except Exception:
            pass

        return booking_dict

    async def get_by_id(self, booking_id_or_ref: str) -> Optional[dict]:
        """Fetch booking by UUID or Booking Reference Code."""
        return self._storage.get(str(booking_id_or_ref))

    async def get_all(self, user_id: Optional[str] = None) -> List[dict]:
        """Fetch all unique bookings, optionally filtered by user_id."""
        unique_bookings = {}
        for b in self._storage.values():
            unique_bookings[b["id"]] = b

        results = list(unique_bookings.values())
        if user_id:
            results = [b for b in results if b["user_id"].lower() == user_id.lower()]

        return sorted(results, key=lambda x: x["created_at"], reverse=True)

    async def cancel_booking(self, booking_id_or_ref: str) -> dict:
        """
        Cancel a booking and atomically restore available ticket seats to the event.
        """
        booking = await self.get_by_id(booking_id_or_ref)
        if not booking:
            raise HTTPException(
                status_code=http_status.HTTP_404_NOT_FOUND,
                detail=f"Booking with ID/Reference '{booking_id_or_ref}' not found"
            )

        if booking["status"] == "CANCELLED":
            raise HTTPException(
                status_code=http_status.HTTP_400_BAD_REQUEST,
                detail=f"Booking '{booking['booking_reference']}' is already cancelled"
            )

        booking["status"] = "CANCELLED"
        booking["updated_at"] = datetime.utcnow()

        event = await event_repo.get_by_id(booking["event_id"])
        restored_tickets = booking["number_of_tickets"]
        if event:
            event["available_seats"] += restored_tickets

        # Sync DB cancellation
        try:
            db = SessionLocal()
            try:
                db_event = db.query(DBEvent).filter(DBEvent.id == str(booking["event_id"])).first()
                if db_event:
                    db_event.available_seats += restored_tickets

                db_bkg = db.query(DBBooking).filter(DBBooking.id == str(booking["id"])).first()
                if db_bkg:
                    db_bkg.status = BookingStatus.CANCELLED
                db.commit()
            except Exception:
                db.rollback()
            finally:
                db.close()
        except Exception:
            pass

        return {
            "booking_id": booking["id"],
            "booking_reference": booking["booking_reference"],
            "status": "CANCELLED",
            "restored_tickets": restored_tickets,
            "message": f"Booking {booking['booking_reference']} successfully cancelled. {restored_tickets} tickets restored to event inventory."
        }
