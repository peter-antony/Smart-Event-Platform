"""initial_schema

Revision ID: 001_initial_schema
Revises: 
Create Date: 2026-07-30

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = '001_initial_schema'
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # 1. users
    op.create_table(
        'users',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('full_name', sa.String(255), nullable=False),
        sa.Column('phone', sa.String(50), nullable=True),
        sa.Column('role', sa.String(50), nullable=False, server_default='user'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_users_email', 'users', ['email'])

    # 2. event_categories
    op.create_table(
        'event_categories',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('name', sa.String(100), nullable=False, unique=True),
        sa.Column('slug', sa.String(100), nullable=False, unique=True),
        sa.Column('description', sa.String(500), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_event_categories_name', 'event_categories', ['name'])

    # 3. venues
    op.create_table(
        'venues',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('name', sa.String(255), nullable=False),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('address', sa.String(255), nullable=False),
        sa.Column('capacity', sa.Integer(), nullable=False, server_default='500'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_venues_city', 'venues', ['city'])

    # 4. events
    op.create_table(
        'events',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('category', sa.String(100), nullable=False),
        sa.Column('category_id', sa.CHAR(36), nullable=True),
        sa.Column('city', sa.String(100), nullable=False),
        sa.Column('location', sa.String(255), nullable=False),
        sa.Column('venue_id', sa.CHAR(36), nullable=True),
        sa.Column('is_virtual', sa.Boolean(), nullable=False, server_default='false'),
        sa.Column('start_time', sa.DateTime(), nullable=False),
        sa.Column('end_time', sa.DateTime(), nullable=False),
        sa.Column('price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('capacity', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('available_seats', sa.Integer(), nullable=False, server_default='100'),
        sa.Column('image_url', sa.String(500), nullable=True),
        sa.Column('tags', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_events_category', 'events', ['category'])
    op.create_index('ix_events_city', 'events', ['city'])
    op.create_index('ix_events_start_time', 'events', ['start_time'])
    op.create_index('ix_events_category_city', 'events', ['category', 'city'])

    # 5. bookings
    op.create_table(
        'bookings',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('booking_reference', sa.String(50), nullable=False, unique=True),
        sa.Column('event_id', sa.CHAR(36), sa.ForeignKey('events.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('number_of_tickets', sa.Integer(), nullable=False, server_default='1'),
        sa.Column('unit_price', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('total_amount', sa.Float(), nullable=False, server_default='0.0'),
        sa.Column('status', sa.String(50), nullable=False, server_default='CONFIRMED'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_bookings_user_id', 'bookings', ['user_id'])
    op.create_index('ix_bookings_status', 'bookings', ['status'])

    # 6. booking_tickets
    op.create_table(
        'booking_tickets',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('booking_id', sa.CHAR(36), sa.ForeignKey('bookings.id', ondelete='CASCADE'), nullable=False),
        sa.Column('ticket_code', sa.String(100), nullable=False, unique=True),
        sa.Column('seat_number', sa.String(50), nullable=True),
        sa.Column('status', sa.String(50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_booking_tickets_ticket_code', 'booking_tickets', ['ticket_code'])

    # 7. notifications
    op.create_table(
        'notifications',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('booking_id', sa.CHAR(36), sa.ForeignKey('bookings.id', ondelete='SET NULL'), nullable=True),
        sa.Column('channel', sa.String(50), nullable=False, server_default='email'),
        sa.Column('recipient', sa.String(255), nullable=False),
        sa.Column('status', sa.String(50), nullable=False, server_default='DISPATCHED'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_notifications_user_id', 'notifications', ['user_id'])

    # 8. agent_conversations
    op.create_table(
        'agent_conversations',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('user_id', sa.String(255), nullable=False),
        sa.Column('conversation_id', sa.String(255), nullable=False, unique=True),
        sa.Column('workflow_status', sa.String(50), nullable=False, server_default='ACTIVE'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index('ix_agent_conversations_conversation_id', 'agent_conversations', ['conversation_id'])

    # 9. agent_messages
    op.create_table(
        'agent_messages',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('conversation_id', sa.String(255), sa.ForeignKey('agent_conversations.conversation_id', ondelete='CASCADE'), nullable=False),
        sa.Column('sender', sa.String(50), nullable=False, server_default='user'),
        sa.Column('message_text', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )

    # 10. agent_actions
    op.create_table(
        'agent_actions',
        sa.Column('id', sa.CHAR(36), primary_key=True),
        sa.Column('conversation_id', sa.String(255), sa.ForeignKey('agent_conversations.conversation_id', ondelete='CASCADE'), nullable=False),
        sa.Column('tool_name', sa.String(100), nullable=False),
        sa.Column('tool_input', sa.JSON(), nullable=True),
        sa.Column('tool_result', sa.JSON(), nullable=True),
        sa.Column('confirmation_status', sa.String(50), nullable=False, server_default='NONE'),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table('agent_actions')
    op.drop_table('agent_messages')
    op.drop_table('agent_conversations')
    op.drop_table('notifications')
    op.drop_table('booking_tickets')
    op.drop_table('bookings')
    op.drop_table('events')
    op.drop_table('venues')
    op.drop_table('event_categories')
    op.drop_table('users')
