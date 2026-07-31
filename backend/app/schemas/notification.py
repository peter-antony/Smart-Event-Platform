import uuid
from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, ConfigDict, Field
from app.models.notification import NotificationType


class NotificationCreate(BaseModel):
    user_id: str = Field("user_default", description="User ID or email")
    title: str = Field(..., description="Notification title headline")
    message: str = Field(..., description="Notification message content")
    notification_type: NotificationType = Field(NotificationType.BOOKING_CONFIRMED, description="Type of notification")
    booking_id: Optional[str] = Field(None, description="Associated Booking UUID")
    recipient: Optional[str] = Field(None, description="Recipient email/user ID")
    channel: str = Field("in_app", description="Notification delivery channel")


class NotificationResponse(BaseModel):
    id: str
    user_id: str
    booking_id: Optional[str] = None
    title: str
    message: str
    notification_type: str
    is_read: bool = False
    channel: str = "in_app"
    recipient: str
    status: str = "DELIVERED"
    created_at: str
    updated_at: str

    model_config = ConfigDict(from_attributes=True)


class NotificationListResponse(BaseModel):
    notifications: List[NotificationResponse]
    unread_count: int
