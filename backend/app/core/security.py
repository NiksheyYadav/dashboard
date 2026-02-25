import hashlib
import hmac
import secrets
from datetime import datetime, timedelta, timezone
from typing import Any

from argon2 import PasswordHasher
from argon2.exceptions import Argon2Error, VerifyMismatchError
from jose import JWTError, jwt

from app.core.config import get_settings

settings = get_settings()
password_hasher = PasswordHasher()


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


def normalize_email(email: str) -> str:
    return email.strip().lower()


def hash_password(raw_password: str) -> str:
    return password_hasher.hash(raw_password + settings.password_pepper)


def verify_password(raw_password: str, password_hash: str) -> bool:
    try:
        return password_hasher.verify(password_hash, raw_password + settings.password_pepper)
    except (VerifyMismatchError, Argon2Error):
        return False


def create_access_token(*, user_id: str, session_id: str) -> str:
    issued_at = now_utc()
    expires_at = issued_at + timedelta(minutes=settings.access_token_ttl_minutes)
    payload = {
        "sub": user_id,
        "sid": session_id,
        "iat": int(issued_at.timestamp()),
        "exp": int(expires_at.timestamp()),
        "iss": settings.jwt_issuer,
    }
    return jwt.encode(payload, settings.jwt_access_secret, algorithm="HS256")


def decode_access_token(token: str) -> dict[str, Any]:
    return jwt.decode(
        token,
        settings.jwt_access_secret,
        algorithms=["HS256"],
        issuer=settings.jwt_issuer,
    )


def generate_refresh_token() -> str:
    return secrets.token_urlsafe(64)


def hash_refresh_token(raw_refresh_token: str) -> str:
    return hmac.new(
        settings.jwt_refresh_secret.encode("utf-8"),
        raw_refresh_token.encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def constant_time_compare(left: str, right: str) -> bool:
    return secrets.compare_digest(left.encode("utf-8"), right.encode("utf-8"))


def is_jwt_error(exc: Exception) -> bool:
    return isinstance(exc, JWTError)
