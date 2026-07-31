import asyncio
import uuid
import logging
from datetime import datetime, timedelta
from app.db.session import AsyncSessionLocal, engine, Base
from app.models import (
    User,
    EventCategory,
    Venue,
    Event,
    Booking,
    BookingStatus,
    BookingTicket,
    Notification,
    AgentConversation,
    AgentMessage,
    AgentAction,
)

logger = logging.getLogger("db_seed")
logging.basicConfig(level=logging.INFO)


async def seed_database():
    """Populates PostgreSQL database with sample seed data for all 10 tables."""
    logger.info("Initializing database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        logger.info("Seeding data across all 10 tables...")

        # 1. Users
        u1 = User(id=str(uuid.uuid4()), email="user@example.com", full_name="Alex Rivera", role="user")
        u2 = User(id=str(uuid.uuid4()), email="john.doe@example.com", full_name="John Doe", role="user")
        u3 = User(id=str(uuid.uuid4()), email="admin@smart-events.com", full_name="System Admin", role="admin")
        session.add_all([u1, u2, u3])

        # 2. Event Categories
        cat_music = EventCategory(id=str(uuid.uuid4()), name="Music", slug="music", description="Live concerts & festivals")
        cat_tech = EventCategory(id=str(uuid.uuid4()), name="Technology", slug="technology", description="Tech conferences & hackathons")
        cat_design = EventCategory(id=str(uuid.uuid4()), name="UI/UX", slug="ui-ux", description="Design workshops & masterclasses")
        cat_sports = EventCategory(id=str(uuid.uuid4()), name="Sports", slug="sports", description="Football & athletic events")
        cat_startup = EventCategory(id=str(uuid.uuid4()), name="Startup", slug="startup", description="Venture & founder meetups")
        session.add_all([cat_music, cat_tech, cat_design, cat_sports, cat_startup])

        # 3. Venues
        v_la = Venue(id=str(uuid.uuid4()), name="Hollywood Bowl Auditorium", city="Los Angeles", address="2301 N Highland Ave", capacity=1200)
        v_sf = Venue(id=str(uuid.uuid4()), name="Moscone Center West", city="San Francisco", address="747 Howard St", capacity=3000)
        v_blr = Venue(id=str(uuid.uuid4()), name="Kanteerava Indoor Stadium", city="Bengaluru", address="Kasturba Rd, Sampangi Rama Nagar", capacity=4000)
        v_austin = Venue(id=str(uuid.uuid4()), name="Austin Tech Hub Studio", city="Austin", address="500 E 4th St", capacity=500)
        session.add_all([v_la, v_sf, v_blr, v_austin])

        await session.flush()

        # 4. Events
        now = datetime.utcnow()
        e1 = Event(
            id=str(uuid.uuid4()),
            title="Acoustic Harmony Music Concert",
            description="An intimate live music concert featuring world-renowned acoustic artists.",
            category="Music",
            category_id=cat_music.id,
            city="Los Angeles",
            location="Hollywood Bowl Auditorium",
            venue_id=v_la.id,
            start_time=now + timedelta(days=10),
            end_time=now + timedelta(days=10, hours=4),
            price=85.0,
            capacity=1200,
            available_seats=340,
            image_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1000&q=80",
            tags=["Music", "Live", "Acoustic", "Concert"]
        )

        e2 = Event(
            id=str(uuid.uuid4()),
            title="Global AI & Cloud Tech Conference 2026",
            description="The premier gathering for AI researchers and cloud engineers.",
            category="Tech Conference",
            category_id=cat_tech.id,
            city="San Francisco",
            location="Moscone Center West",
            venue_id=v_sf.id,
            start_time=now + timedelta(days=15),
            end_time=now + timedelta(days=17),
            price=299.0,
            capacity=3000,
            available_seats=1250,
            image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1000&q=80",
            tags=["Tech", "AI", "Cloud", "Conference"]
        )

        e3 = Event(
            id=str(uuid.uuid4()),
            title="Modern UI/UX Design Systems Workshop",
            description="Hands-on interactive masterclass on designing scalable design systems.",
            category="UI/UX Workshop",
            category_id=cat_design.id,
            city="Austin",
            location="Austin Tech Hub Studio",
            venue_id=v_austin.id,
            start_time=now + timedelta(days=5),
            end_time=now + timedelta(days=5, hours=6),
            price=49.0,
            capacity=500,
            available_seats=85,
            image_url="https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=1000&q=80",
            tags=["UI/UX", "Design", "Workshop", "Figma"]
        )

        e4 = Event(
            id=str(uuid.uuid4()),
            title="International Premier Football Championship",
            description="High-octane football tournament featuring top international clubs.",
            category="Sports",
            category_id=cat_sports.id,
            city="Bengaluru",
            location="Kanteerava Indoor Stadium",
            venue_id=v_blr.id,
            start_time=now + timedelta(days=20),
            end_time=now + timedelta(days=20, hours=3),
            price=35.0,
            capacity=4000,
            available_seats=2100,
            image_url="https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1000&q=80",
            tags=["Sports", "Football", "Championship", "Bengaluru"]
        )

        session.add_all([e1, e2, e3, e4])
        await session.flush()

        # 5. Bookings
        b1 = Booking(
            id=str(uuid.uuid4()),
            booking_reference="BK-SEED001",
            event_id=e1.id,
            user_id="user@example.com",
            number_of_tickets=2,
            unit_price=85.0,
            total_amount=170.0,
            status=BookingStatus.CONFIRMED
        )
        session.add(b1)
        await session.flush()

        # 6. Booking Tickets
        t1 = BookingTicket(id=str(uuid.uuid4()), booking_id=b1.id, ticket_code="TK-A101", seat_number="A-101")
        t2 = BookingTicket(id=str(uuid.uuid4()), booking_id=b1.id, ticket_code="TK-A102", seat_number="A-102")
        session.add_all([t1, t2])

        # 7. Notifications
        n1 = Notification(id=str(uuid.uuid4()), user_id="user@example.com", booking_id=b1.id, channel="email", recipient="user@example.com", status="DISPATCHED")
        session.add(n1)

        # 8. Agent Conversations
        conv_id = "conv-seed-888"
        c1 = AgentConversation(id=str(uuid.uuid4()), user_id="user@example.com", conversation_id=conv_id, workflow_status="COMPLETED")
        session.add(c1)
        await session.flush()

        # 9. Agent Messages
        m1 = AgentMessage(id=str(uuid.uuid4()), conversation_id=conv_id, sender="user", message_text="Find music events in Los Angeles")
        m2 = AgentMessage(id=str(uuid.uuid4()), conversation_id=conv_id, sender="assistant", message_text="Found Acoustic Harmony Music Concert in Los Angeles.")
        session.add_all([m1, m2])

        # 10. Agent Actions
        act1 = AgentAction(
            id=str(uuid.uuid4()),
            conversation_id=conv_id,
            tool_name="search_events",
            tool_input={"category": "Music", "city": "Los Angeles"},
            tool_result={"count": 1},
            confirmation_status="NONE"
        )
        session.add(act1)

        await session.commit()
        logger.info("Successfully seeded database across all 10 tables!")

if __name__ == "__main__":
    asyncio.run(seed_database())
