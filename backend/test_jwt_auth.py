import asyncio
import json
from app.api.v1.auth_routes import register_user, login_user, refresh_access_token, get_current_user_profile
from app.schemas.auth import UserRegister, UserLogin, RefreshTokenRequest
from app.core.security import verify_jwt_token
from app.core.auth_deps import require_role
from app.api.v1.events import delete_event
from fastapi import HTTPException


async def run_jwt_auth_tests():
    print("--- 1. Testing User Registration & Token Generation ---")
    reg_in = UserRegister(
        email="new_attendee@example.com",
        password="securepassword123",
        full_name="Jane Attendee",
        role="ATTENDEE"
    )
    reg_res = await register_user(reg_in)

    print(f"Issued Access Token: {reg_res.access_token[:30]}...")
    print(f"Issued Refresh Token: {reg_res.refresh_token[:30]}...")
    print(f"User Role: {reg_res.user.role}")

    assert reg_res.access_token is not None
    assert reg_res.refresh_token is not None
    assert reg_res.user.role == "ATTENDEE"

    print("\n--- 2. Testing JWT Signature Verification ---")
    payload = verify_jwt_token(reg_res.access_token)
    print(f"Decoded Token Sub: {payload['sub']}")
    print(f"Decoded Token Email: {payload['email']}")
    print(f"Decoded Token Role: {payload['role']}")

    assert payload["email"] == "new_attendee@example.com"
    assert payload["role"] == "ATTENDEE"

    print("\n--- 3. Testing User Login ---")
    login_in = UserLogin(email="admin@smart-events.com", password="password123")
    login_res = await login_user(login_in)
    print(f"Admin Logged In: {login_res.user.full_name} ({login_res.user.role})")
    assert login_res.user.role == "ADMIN"

    print("\n--- 4. Testing Access Token Refresh ---")
    refresh_in = RefreshTokenRequest(refresh_token=reg_res.refresh_token)
    refreshed = await refresh_access_token(refresh_in)
    print(f"New Access Token: {refreshed.access_token[:30]}...")
    assert refreshed.access_token is not None

    print("\n--- 5. Testing RBAC Role Restrictions ---")
    # ATTENDEE context attempting ADMIN action (DELETE /api/events)
    attendee_user = {"id": reg_res.user.id, "email": reg_res.user.email, "role": "ATTENDEE"}
    admin_checker = require_role(["ADMIN"])

    try:
        await admin_checker(current_user=attendee_user)
        print("ERROR: ATTENDEE was not blocked from ADMIN action!")
        assert False
    except HTTPException as err:
        print(f"Passed RBAC Gate! ATTENDEE properly blocked with Status {err.status_code}: {err.detail}")
        assert err.status_code == 403

    # ADMIN context attempting ADMIN action
    admin_user = {"id": "admin-111", "email": "admin@smart-events.com", "role": "ADMIN"}
    granted_admin = await admin_checker(current_user=admin_user)
    print(f"Granted Access to ADMIN: {granted_admin['email']}")
    assert granted_admin["role"] == "ADMIN"

    print("\nSUCCESS: ALL JWT AUTHENTICATION & RBAC AUTHORIZATION TESTS PASSED CLEANLY!")

if __name__ == "__main__":
    asyncio.run(run_jwt_auth_tests())
