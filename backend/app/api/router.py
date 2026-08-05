from fastapi import APIRouter
from app.api.v1.events import router as events_router
from app.api.v1.bookings import router as bookings_router
from app.api.v1.agent_routes import router as agent_router
from app.api.v1.notifications import router as notifications_router
from app.api.v1.auth_routes import router as auth_router
from app.api.v1.admin_routes import router as admin_router

api_router = APIRouter()

api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(admin_router, prefix="/admin", tags=["Admin User Management"])
api_router.include_router(events_router, prefix="/events", tags=["Events"])
api_router.include_router(bookings_router, prefix="/bookings", tags=["Bookings"])
api_router.include_router(agent_router, prefix="/agent", tags=["AI Agent"])
api_router.include_router(notifications_router, prefix="/notifications", tags=["Notifications"])


@api_router.get("/health", tags=["Health Check"])
async def health_check():
    return {
        "status": "healthy",
        "service": "Smart Event Platform API",
        "version": "1.0.0"
    }
