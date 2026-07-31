import uuid
from datetime import datetime, timedelta
# pyrefly: ignore [missing-import]
from sqlalchemy import create_engine, select, func
# pyrefly: ignore [missing-import]
from sqlalchemy.orm import sessionmaker
from app.db.session import Base
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

# Standard SQLite in-memory engine for zero-dependency testing
engine = create_engine("sqlite:///:memory:", echo=False)
SessionLocal = sessionmaker(bind=engine)


def run_db_verification_tests():
    print("--- 1. Initializing 10 PostgreSQL SQLAlchemy Tables (In-Memory Engine) ---")
    Base.metadata.create_all(bind=engine)

    session = SessionLocal()
    print("\n--- 2. Seeding Data Across All 10 Tables ---")

    # 1. Users
    u1 = User(id=str(uuid.uuid4()), email="attendee@example.com", full_name="Attendee User", role="ATTENDEE")
    u2 = User(id=str(uuid.uuid4()), email="organizer@example.com", full_name="Organizer User", role="ORGANIZER")
    u3 = User(id=str(uuid.uuid4()), email="admin@smart-events.com", full_name="System Admin", role="ADMIN")
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
    v_blr = Venue(id=str(uuid.uuid4()), name="Kanteerava Indoor Stadium", city="Bengaluru", address="Kasturba Rd", capacity=4000)
    v_austin = Venue(id=str(uuid.uuid4()), name="Austin Tech Hub Studio", city="Austin", address="500 E 4th St", capacity=500)
    session.add_all([v_la, v_sf, v_blr, v_austin])

    session.flush()

    # 4. Events
    now = datetime.utcnow()
    e1 = Event(
        id=str(uuid.uuid4()),
        title="Acoustic Harmony Music Concert",
        description="Live acoustic music concert.",
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
        image_url="https://images.unsplash.com/photo-1514525253161-7a46d19cd819",
        tags=["Music", "Concert"]
    )

    e2 = Event(
        id=str(uuid.uuid4()),
        title="Global AI & Cloud Tech Conference 2026",
        description="AI research gathering.",
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
        image_url="https://images.unsplash.com/photo-1540575467063-178a50c2df87",
        tags=["Tech", "AI"]
    )

    session.add_all([e1, e2])
    session.flush()

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
    session.flush()

    # 6. Booking Tickets
    t1 = BookingTicket(id=str(uuid.uuid4()), booking_id=b1.id, ticket_code="TK-A101", seat_number="A-101")
    t2 = BookingTicket(id=str(uuid.uuid4()), booking_id=b1.id, ticket_code="TK-A102", seat_number="A-102")
    session.add_all([t1, t2])

    # 7. Notifications
    n1 = Notification(
        id=str(uuid.uuid4()),
        user_id="attendee@example.com",
        booking_id=b1.id,
        title="Booking Pass Issued",
        message="Your e-ticket pass has been issued.",
        channel="email",
        recipient="attendee@example.com",
        status="DISPATCHED"
    )
    session.add(n1)

    # 8. Agent Conversations
    conv_id = "conv-seed-888"
    c1 = AgentConversation(id=str(uuid.uuid4()), user_id="user@example.com", conversation_id=conv_id, workflow_status="COMPLETED")
    session.add(c1)
    session.flush()

    # 9. Agent Messages
    m1 = AgentMessage(id=str(uuid.uuid4()), conversation_id=conv_id, sender="user", message_text="Find music events in Los Angeles")
    m2 = AgentMessage(id=str(uuid.uuid4()), conversation_id=conv_id, sender="assistant", message_text="Found Acoustic Harmony Music Concert.")
    session.add_all([m1, m2])

    # 10. Agent Actions
    act1 = AgentAction(
        id=str(uuid.uuid4()),
        conversation_id=conv_id,
        tool_name="search_events",
        tool_input={"category": "Music"},
        tool_result={"count": 1},
        confirmation_status="NONE"
    )
    session.add(act1)

    session.commit()

    print("\n--- 3. Verifying Table Row Counts Across All 10 Tables ---")
    user_count = session.execute(select(func.count(User.id))).scalar()
    cat_count = session.execute(select(func.count(EventCategory.id))).scalar()
    venue_count = session.execute(select(func.count(Venue.id))).scalar()
    event_count = session.execute(select(func.count(Event.id))).scalar()
    booking_count = session.execute(select(func.count(Booking.id))).scalar()
    ticket_count = session.execute(select(func.count(BookingTicket.id))).scalar()
    notif_count = session.execute(select(func.count(Notification.id))).scalar()
    conv_count = session.execute(select(func.count(AgentConversation.id))).scalar()
    msg_count = session.execute(select(func.count(AgentMessage.id))).scalar()
    act_count = session.execute(select(func.count(AgentAction.id))).scalar()

    print(f"1. users: {user_count} rows")
    print(f"2. event_categories: {cat_count} rows")
    print(f"3. venues: {venue_count} rows")
    print(f"4. events: {event_count} rows")
    print(f"5. bookings: {booking_count} rows")
    print(f"6. booking_tickets: {ticket_count} rows")
    print(f"7. notifications: {notif_count} rows")
    print(f"8. agent_conversations: {conv_count} rows")
    print(f"9. agent_messages: {msg_count} rows")
    print(f"10. agent_actions: {act_count} rows")

    assert user_count >= 3
    assert cat_count >= 5
    assert venue_count >= 4
    assert event_count >= 2
    assert booking_count >= 1
    assert ticket_count >= 2
    assert notif_count >= 1
    assert conv_count >= 1
    assert msg_count >= 2
    assert act_count >= 1

    session.close()
    print("\nSUCCESS: ALL 10 POSTGRESQL DATABASE TABLES VERIFIED & SEEDED CLEANLY!")

if __name__ == "__main__":
    run_db_verification_tests()
