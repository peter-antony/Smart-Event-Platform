from fastapi import APIRouter, HTTPException, Query, status
from app.services.notification_service import NotificationService
from app.schemas.notification import NotificationCreate, NotificationResponse, NotificationListResponse

router = APIRouter()


@router.get("", response_model=NotificationListResponse, summary="GET /api/notifications - List user in-app notifications")
async def get_notifications(user_id: str = Query("user_default", alias="userId")):
    """Retrieves all in-app notifications and unread badge count for a user."""
    try:
        return await NotificationService.get_user_notifications(user_id=user_id)
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch notifications: {str(err)}"
        )


@router.put("/{notification_id}/read", response_model=NotificationResponse, summary="PUT /api/notifications/{id}/read - Mark notification as read")
async def mark_notification_read(notification_id: str):
    """Marks a specific in-app notification as read."""
    res = await NotificationService.mark_as_read(notification_id)
    if not res:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Notification '{notification_id}' not found"
        )
    return res


@router.put("/read-all", summary="PUT /api/notifications/read-all - Mark all notifications as read")
async def mark_all_notifications_read(user_id: str = Query("user_default", alias="userId")):
    """Marks all in-app notifications as read for a user."""
    updated_count = await NotificationService.mark_all_as_read(user_id=user_id)
    return {"status": "SUCCESS", "marked_read_count": updated_count}


@router.post("", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED, summary="POST /api/notifications - Create & broadcast notification")
async def create_notification(payload: NotificationCreate):
    """Creates an in-app notification record and broadcasts live via Socket.IO."""
    try:
        return await NotificationService.create_notification(
            user_id=payload.user_id,
            title=payload.title,
            message=payload.message,
            notification_type=payload.notification_type,
            booking_id=payload.booking_id,
            recipient=payload.recipient
        )
    except Exception as err:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create notification: {str(err)}"
        )
