# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings
from app.api.router import api_router

from app.api.v1.events import router as direct_events_router
from app.api.v1.bookings import router as direct_bookings_router
from app.api.v1.agent_routes import router as direct_agent_router
from app.api.v1.notifications import router as direct_notifications_router
from app.api.v1.auth_routes import router as direct_auth_router

from app.db.session import engine, Base
import app.models.user
import app.models.event
import app.models.booking
import app.models.notification

try:
    Base.metadata.create_all(bind=engine)
except Exception:
    pass

app = FastAPI(
    title=settings.APP_NAME,
    description="Production Scalable Smart Event Platform API with FastAPI & AI Assistant",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS Middleware
if settings.BACKEND_CORS_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[str(origin) for origin in settings.BACKEND_CORS_ORIGINS],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# Standard API Router Mount (/api/v1)
app.include_router(api_router, prefix=settings.API_V1_STR)

# Direct Mounts matching exact API specifications
app.include_router(direct_auth_router, prefix="/api/auth", tags=["Authentication Direct"])
app.include_router(direct_events_router, prefix="/api/events", tags=["Events Direct"])
app.include_router(direct_bookings_router, prefix="/api/bookings", tags=["Bookings Direct"])
app.include_router(direct_agent_router, prefix="/api/agent", tags=["AI Agent Direct"])
app.include_router(direct_notifications_router, prefix="/api/notifications", tags=["Notifications Direct"])


@app.get("/", summary="Root Health Check")
async def root():
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "docs": "/docs",
        "health_check": "/api/v1/health",
        "auth_api": "/api/auth",
        "events_api": "/api/events",
        "bookings_api": "/api/bookings",
        "agent_chat_api": "/api/agent/chat",
        "notifications_api": "/api/notifications"
    }


if __name__ == "__main__":
    # pyrefly: ignore [missing-import]
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
