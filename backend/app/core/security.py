import os
import hashlib
import hmac
import base64
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, Any, Optional

logger = logging.getLogger("security")

SECRET_KEY = os.getenv("JWT_SECRET_KEY", "smart_event_platform_secret_jwt_key_2026_super_secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours
REFRESH_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7  # 7 days


def hash_password(password: str) -> str:
    """Hashes password securely using SHA-256 with salt."""
    salt = "smart_event_salt_2026"
    return hashlib.sha256(f"{salt}:{password}".encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifies plain text password against stored hash."""
    return hash_password(plain_password) == hashed_password


def _base64url_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b'=').decode('utf-8')


def _base64url_decode(data: str) -> bytes:
    padding = '=' * (4 - (len(data) % 4))
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """Generates signed JWT Access Token with user_id, email, and role claims."""
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": int(expire.timestamp()), "type": "access"})

    header = {"alg": ALGORITHM, "typ": "JWT"}
    encoded_header = _base64url_encode(json.dumps(header).encode('utf-8'))
    encoded_payload = _base64url_encode(json.dumps(to_encode).encode('utf-8'))

    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{encoded_header}.{encoded_payload}".encode('utf-8'),
        hashlib.sha256
    ).digest()

    encoded_signature = _base64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def create_refresh_token(data: Dict[str, Any]) -> str:
    """Generates signed JWT Refresh Token."""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=REFRESH_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": int(expire.timestamp()), "type": "refresh"})

    header = {"alg": ALGORITHM, "typ": "JWT"}
    encoded_header = _base64url_encode(json.dumps(header).encode('utf-8'))
    encoded_payload = _base64url_encode(json.dumps(to_encode).encode('utf-8'))

    signature = hmac.new(
        SECRET_KEY.encode('utf-8'),
        f"{encoded_header}.{encoded_payload}".encode('utf-8'),
        hashlib.sha256
    ).digest()

    encoded_signature = _base64url_encode(signature)
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"


def verify_jwt_token(token: str) -> Optional[Dict[str, Any]]:
    """Verifies JWT signature and returns decoded payload dict if valid."""
    try:
        parts = token.split('.')
        if len(parts) != 3:
            return None

        encoded_header, encoded_payload, encoded_signature = parts
        expected_sig = _base64url_encode(
            hmac.new(
                SECRET_KEY.encode('utf-8'),
                f"{encoded_header}.{encoded_payload}".encode('utf-8'),
                hashlib.sha256
            ).digest()
        )

        if not hmac.compare_digest(encoded_signature, expected_sig):
            logger.warning("[Security] Invalid JWT signature")
            return None

        payload = json.loads(_base64url_decode(encoded_payload).decode('utf-8'))
        exp = payload.get("exp")
        if exp and datetime.utcnow().timestamp() > exp:
            logger.warning("[Security] Expired JWT token")
            return None

        return payload
    except Exception as err:
        logger.error(f"[Security] JWT verification error: {err}")
        return None
