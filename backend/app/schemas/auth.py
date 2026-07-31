from typing import Optional
from pydantic import BaseModel, EmailStr, Field


class UserRegister(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="User password (min 6 chars)")
    full_name: str = Field(..., description="Full user display name")
    role: str = Field("ATTENDEE", description="Role: ATTENDEE, ORGANIZER, ADMIN")


class UserLogin(BaseModel):
    email: str = Field(..., description="User registered email")
    password: str = Field(..., description="User password")


class UserProfileResponse(BaseModel):
    id: str
    email: str
    full_name: str
    role: str
    phone: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserProfileResponse


class RefreshTokenRequest(BaseModel):
    refresh_token: str = Field(..., description="Valid JWT Refresh Token")
