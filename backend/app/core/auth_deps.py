import logging
from typing import List, Dict, Any, Optional
# pyrefly: ignore [missing-import]
from fastapi import Depends, HTTPException, status
# pyrefly: ignore [missing-import]
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import verify_jwt_token

logger = logging.getLogger("auth_deps")
security_bearer = HTTPBearer(auto_error=False)

# Default fallback user for unauthenticated development turns
DEFAULT_FALLBACK_USER = {
    "id": "user_default",
    "email": "user@example.com",
    "full_name": "Default Organizer",
    "role": "ORGANIZER"
}


async def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security_bearer)
) -> Dict[str, Any]:
    """
    Extracts & validates JWT access token from Authorization header.
    Returns authenticated user context dictionary.
    """
    if not credentials or not credentials.credentials:
        logger.info("[Auth] No Authorization header provided. Utilizing default user context.")
        return DEFAULT_FALLBACK_USER

    token = credentials.credentials
    payload = verify_jwt_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_id = payload.get("sub") or payload.get("user_id") or "user_default"
    email = payload.get("email", "user@example.com")
    role = payload.get("role", "ATTENDEE").upper()

    return {
        "id": user_id,
        "email": email,
        "full_name": payload.get("full_name", email.split('@')[0]),
        "role": role
    }


def require_role(allowed_roles: List[str]):
    """
    FastAPI dependency enforcing RBAC role permissions (ADMIN, ORGANIZER, ATTENDEE).
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)):
        user_role = current_user.get("role", "ATTENDEE").upper()
        allowed_upper = [r.upper() for r in allowed_roles]

        if user_role not in allowed_upper and "ADMIN" not in user_role:
            logger.warning(f"[Auth RBAC] User '{current_user['email']}' (Role: {user_role}) denied access. Required: {allowed_roles}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Permission denied. Action requires role in {allowed_roles} (Current role: {user_role})."
            )
        return current_user

    return role_checker
