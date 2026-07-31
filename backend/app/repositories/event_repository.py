import uuid
from typing import List, Optional
from datetime import datetime, timedelta
from app.schemas.event import EventCreate, EventUpdate, EventSearchFilter
from app.db.session import SessionLocal
from app.models.event import Event as DBEvent


class EventRepository:
    """
    Event Repository Layer handling data persistence in SQLite database and in-memory fallback.
    """

    _storage: dict = {}
    _seeded: bool = False

    def __init__(self):
        if not EventRepository._seeded:
            self._seed_sample_events()
            EventRepository._seeded = True

    def _seed_sample_events(self):
        """Seed initial sample events with organizer IDs."""
        now = datetime.utcnow()
        samples = [
            {
                "id": str(uuid.uuid4()),
                "title": "Acoustic Harmony Music Concert",
                "description": "An intimate live music concert featuring world-renowned acoustic artists and orchestral arrangements.",
                "category": "Music",
                "city": "Los Angeles",
                "location": "Hollywood Bowl Auditorium",
                "venue_name": "Hollywood Bowl Auditorium",
                "address": "2301 N Highland Ave",
                "state": "CA",
                "event_type": "In-Person",
                "status": "PUBLISHED",
                "organizer_id": "organizer@example.com",
                "is_virtual": False,
                "start_time": now + timedelta(days=10),
                "end_time": now + timedelta(days=10, hours=4),
                "price": 85.00,
                "capacity": 1200,
                "available_seats": 340,
                "image_url": "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
                "tags": ["Music", "Live", "Acoustic", "Concert"],
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Global AI & Cloud Tech Conference 2026",
                "description": "Annual tech summit focusing on generative AI, agentic LLM pipelines, microservices, and distributed cloud.",
                "category": "Technology",
                "city": "San Francisco",
                "location": "Moscone Convention Center",
                "venue_name": "Moscone Center West",
                "address": "747 Howard St",
                "state": "CA",
                "event_type": "In-Person",
                "status": "PUBLISHED",
                "organizer_id": "organizer@example.com",
                "is_virtual": True,
                "start_time": now + timedelta(days=20),
                "end_time": now + timedelta(days=22),
                "price": 299.00,
                "capacity": 1500,
                "available_seats": 420,
                "image_url": "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
                "tags": ["AI", "Tech", "FastAPI", "Cloud"],
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Modern UI/UX Design Systems Masterclass",
                "description": "Hands-on masterclass on building accessible design systems and sleek glassmorphism UIs.",
                "category": "UI/UX Workshop",
                "city": "Austin",
                "location": "Austin Tech Hub Studio",
                "venue_name": "Austin Tech Hub Studio",
                "address": "500 E 6th St",
                "state": "TX",
                "event_type": "In-Person",
                "status": "DRAFT",
                "organizer_id": "organizer@example.com",
                "is_virtual": False,
                "start_time": now + timedelta(days=5),
                "end_time": now + timedelta(days=5, hours=6),
                "price": 49.00,
                "capacity": 150,
                "available_seats": 150,
                "image_url": "https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
                "tags": ["UI/UX", "Design", "Figma"],
                "created_at": now,
                "updated_at": now
            },
            {
                "id": str(uuid.uuid4()),
                "title": "Other Organizer Private Gala",
                "description": "Exclusive private summit hosted by external organizer.",
                "category": "Technology",
                "city": "New York",
                "location": "Javits Center",
                "venue_name": "Javits Center",
                "address": "429 11th Ave",
                "state": "NY",
                "event_type": "In-Person",
                "status": "PUBLISHED",
                "organizer_id": "other_organizer@example.com",
                "is_virtual": False,
                "start_time": now + timedelta(days=30),
                "end_time": now + timedelta(days=30, hours=4),
                "price": 500.00,
                "capacity": 200,
                "available_seats": 200,
                "image_url": "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
                "tags": ["Private"],
                "created_at": now,
                "updated_at": now
            }
        ]

        for item in samples:
            self._storage[item["id"]] = item

    async def get_all(self) -> List[dict]:
        """Fetch all events sorted by start time."""
        return sorted(list(self._storage.values()), key=lambda x: str(x.get("start_time", "")))

    async def get_by_id(self, event_id: str) -> Optional[dict]:
        """Retrieve single event by UUID."""
        return self._storage.get(str(event_id))

    async def create(self, event_in: EventCreate) -> dict:
        """Create new event entry in SQLite via SQLAlchemy and store in repository."""
        now = datetime.utcnow()
        new_id = str(uuid.uuid4())

        title = event_in.title or event_in.name or event_in.event_name or "Untitled Event"
        venue_name = event_in.venue_name or "Main Hall"
        address = event_in.address or "Center St"
        state = event_in.state or "CA"
        city = event_in.city or "San Francisco"
        location = event_in.location or f"{venue_name}, {city}"
        event_type = event_in.event_type or "In-Person"
        organizer_id = event_in.organizer_id or "organizer@example.com"

        status_val = (event_in.status or "PUBLISHED").upper()
        if status_val not in ["DRAFT", "PUBLISHED", "CANCELLED", "COMPLETED"]:
            status_val = "PUBLISHED"

        start_time = event_in.start_time or (now + timedelta(days=7))
        end_time = event_in.end_time or (start_time + timedelta(hours=4))

        price = event_in.price if event_in.price is not None else (event_in.ticket_price or 0.0)
        capacity = event_in.capacity if event_in.capacity is not None else (event_in.total_tickets or 100)
        available_seats = event_in.available_seats if event_in.available_seats is not None else capacity
        image_url = event_in.image_url or event_in.event_image or "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80"

        event_dict = {
            "id": new_id,
            "title": title,
            "description": event_in.description,
            "category": event_in.category,
            "city": city,
            "location": location,
            "venue_name": venue_name,
            "address": address,
            "state": state,
            "event_type": event_type,
            "status": status_val,
            "organizer_id": organizer_id,
            "is_virtual": event_in.is_virtual or (event_type == "Virtual"),
            "start_time": start_time,
            "end_time": end_time,
            "price": price,
            "capacity": capacity,
            "available_seats": available_seats,
            "image_url": image_url,
            "tags": event_in.tags or [],
            "created_at": now,
            "updated_at": now
        }

        # Store in memory storage
        self._storage[new_id] = event_dict

        # Persist in SQLite DB using SQLAlchemy structure
        try:
            db = SessionLocal()
            try:
                db_event = DBEvent(
                    id=new_id,
                    title=title,
                    description=event_in.description,
                    category=event_in.category,
                    city=city,
                    location=location,
                    venue_name=venue_name,
                    address=address,
                    state=state,
                    event_type=event_type,
                    status=status_val,
                    organizer_id=organizer_id,
                    is_virtual=event_in.is_virtual or (event_type == "Virtual"),
                    start_time=start_time,
                    end_time=end_time,
                    price=price,
                    capacity=capacity,
                    available_seats=available_seats,
                    image_url=image_url,
                    tags=event_in.tags or []
                )
                db.add(db_event)
                db.commit()
                db.refresh(db_event)
            finally:
                db.close()
        except Exception:
            pass

        return event_dict

    async def update(self, event_id: str, event_in: EventUpdate) -> Optional[dict]:
        """Update existing event by UUID."""
        existing = self._storage.get(str(event_id))
        if not existing:
            return None

        update_data = event_in.model_dump(exclude_unset=True)
        for key, val in update_data.items():
            if val is not None:
                existing[key] = val

        existing["updated_at"] = datetime.utcnow()
        self._storage[str(event_id)] = existing
        return existing

    async def delete(self, event_id: str) -> bool:
        """Delete event by UUID."""
        if str(event_id) in self._storage:
            del self._storage[str(event_id)]
            return True
        return False

    async def search(self, filters: EventSearchFilter) -> List[dict]:
        """Multi-criteria search filtering for events including organizer_id and status."""
        results = list(self._storage.values())

        if filters.organizer_id:
            results = [e for e in results if e.get("organizer_id") == filters.organizer_id]

        if filters.status:
            stat = filters.status.strip().upper()
            results = [e for e in results if e.get("status", "").upper() == stat]

        if filters.category and filters.category != "All":
            cat = filters.category.strip().lower()
            results = [e for e in results if cat in e["category"].lower()]

        if filters.name:
            n = filters.name.strip().lower()
            results = [e for e in results if n in e["title"].lower() or n in e.get("description", "").lower()]

        if filters.city:
            c = filters.city.strip().lower()
            results = [e for e in results if c in e["city"].lower()]

        if filters.start_date:
            results = [e for e in results if e.get("start_time") and e["start_time"] >= filters.start_date]

        if filters.end_date:
            results = [e for e in results if e.get("end_time") and e["end_time"] <= filters.end_date]

        if filters.min_price is not None:
            results = [e for e in results if e["price"] >= filters.min_price]

        if filters.max_price is not None:
            results = [e for e in results if e["price"] <= filters.max_price]

        if filters.available_tickets is not None:
            results = [e for e in results if e["available_seats"] >= filters.available_tickets]

        return sorted(results, key=lambda x: str(x.get("start_time", "")))
