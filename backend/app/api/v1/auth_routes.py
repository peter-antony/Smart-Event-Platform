import uuid
import logging
from typing import Dict, Any
# pyrefly: ignore [missing-import]
from fastapi import APIRouter, HTTPException, Depends, status
from app.schemas.auth import (
    UserRegister,
    UserLogin,
    TokenResponse,
    RefreshTokenRequest,
    UserProfileResponse
)
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    verify_jwt_token
)
from app.core.auth_deps import get_current_user

logger = logging.getLogger("auth_routes")
router = APIRouter()

# In-memory user database registry for authentication
_user_registry: Dict[str, Dict[str, Any]] = {
    "attendee@example.com": {
        "id": "user-attendee-111",
        "email": "attendee@example.com",
        "password_hash": hash_password("password123"),
        "full_name": "Attendee User",
        "role": "ATTENDEE"
    },
    "organizer@example.com": {
        "id": "org-organizer-222",
        "email": "organizer@example.com",
        "password_hash": hash_password("password123"),
        "full_name": "Organizer User",
        "role": "ORGANIZER"
    },
    "user@example.com": {
        "id": "user-default-111",
        "email": "user@example.com",
        "password_hash": hash_password("password123"),
        "full_name": "Alex Rivera",
        "role": "ATTENDEE"
    },
    "organizer@smart-events.com": {
        "id": "org-222",
        "email": "organizer@smart-events.com",
        "password_hash": hash_password("password123"),
        "full_name": "Sarah Event Organizer",
        "role": "ORGANIZER"
    },
    "admin@example.com": {
        "id": "admin-demo-333",
        "email": "admin@example.com",
        "password_hash": hash_password("password123"),
        "full_name": "System Administrator",
        "role": "ADMIN"
    },
    "admin@smart-events.com": {
        "id": "admin-333",
        "email": "admin@smart-events.com",
        "password_hash": hash_password("password123"),
        "full_name": "System Administrator",
        "role": "ADMIN"
    }
}


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED, summary="POST /api/auth/register - Register new user account")
async def register_user(payload: UserRegister):
    """Registers a new user account with hashed password and role (ATTENDEE, ORGANIZER, ADMIN)."""
    email_clean = payload.email.lower().strip()
    if email_clean in _user_registry:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"User with email '{payload.email}' already exists"
        )

    user_id = str(uuid.uuid4())
    hashed_pwd = hash_password(payload.password)
    role_clean = payload.role.upper()

    if role_clean not in ["ADMIN", "ORGANIZER", "ATTENDEE"]:
        role_clean = "ATTENDEE"

    user_entry = {
        "id": user_id,
        "email": email_clean,
        "password_hash": hashed_pwd,
        "full_name": payload.full_name,
        "role": role_clean
    }
    _user_registry[email_clean] = user_entry
    logger.info(f"[Auth] Registered user: '{email_clean}' with role '{role_clean}'")

    token_claims = {"sub": user_id, "email": email_clean, "role": role_clean, "full_name": payload.full_name}
    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserProfileResponse(
            id=user_id,
            email=email_clean,
            full_name=payload.full_name,
            role=role_clean
        )
    )


@router.post("/login", response_model=TokenResponse, summary="POST /api/auth/login - Authenticate user credentials")
async def login_user(payload: UserLogin):
    """Authenticates credentials and returns JWT Access and Refresh Tokens."""
    email_clean = payload.email.lower().strip()
    user_entry = _user_registry.get(email_clean)

    if not user_entry or not verify_password(payload.password, user_entry["password_hash"]):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password credentials"
        )

    token_claims = {
        "sub": user_entry["id"],
        "email": user_entry["email"],
        "role": user_entry["role"],
        "full_name": user_entry["full_name"]
    }
    access_token = create_access_token(token_claims)
    refresh_token = create_refresh_token(token_claims)

    logger.info(f"[Auth] Logged in user: '{email_clean}' ({user_entry['role']})")

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        token_type="bearer",
        user=UserProfileResponse(
            id=user_entry["id"],
            email=user_entry["email"],
            full_name=user_entry["full_name"],
            role=user_entry["role"]
        )
    )


@router.post("/refresh", response_model=TokenResponse, summary="POST /api/auth/refresh - Refresh access token")
async def refresh_access_token(payload: RefreshTokenRequest):
    """Verifies refresh token and issues a new access token."""
    decoded = verify_jwt_token(payload.refresh_token)
    if not decoded or decoded.get("type") != "refresh":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )

    user_id = decoded.get("sub") or decoded.get("user_id")
    email = decoded.get("email")
    role = decoded.get("role", "ATTENDEE")
    name = decoded.get("full_name", email)

    token_claims = {"sub": user_id, "email": email, "role": role, "full_name": name}
    new_access = create_access_token(token_claims)
    new_refresh = create_refresh_token(token_claims)

    return TokenResponse(
        access_token=new_access,
        refresh_token=new_refresh,
        token_type="bearer",
        user=UserProfileResponse(
            id=user_id,
            email=email,
            full_name=name,
            role=role
        )
    )


@router.get("/me", response_model=UserProfileResponse, summary="GET /api/auth/me - Get authenticated user profile")
async def get_current_user_profile(current_user: Dict[str, Any] = Depends(get_current_user)):
    """Returns profile information for the authenticated user."""
    return UserProfileResponse(
        id=current_user["id"],
        email=current_user["email"],
        full_name=current_user["full_name"],
        role=current_user["role"]
    )
