import secrets
from datetime import timedelta
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy import String, cast, select, update
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    normalize_email,
    now_utc,
    verify_password,
)
from app.models.password_reset import PasswordResetToken
from app.models.refresh_token import RefreshToken
from app.models.session import Session as UserSession
from app.models.user import User
from app.utils.email import send_password_reset_email

settings = get_settings()


class AuthService:
    @staticmethod
    def _get_user_by_id(db: Session, user_id: UUID | str) -> User | None:
        return db.scalar(select(User).where(cast(User.id, String) == str(user_id)))

    @staticmethod
    def _get_session_by_id(db: Session, session_id: UUID | str) -> UserSession | None:
        return db.scalar(select(UserSession).where(cast(UserSession.id, String) == str(session_id)))

    @staticmethod
    def register_user(db: Session, *, email: str, password: str) -> User:
        normalized_email = normalize_email(email)
        existing = db.scalar(select(User).where(User.email == normalized_email))
        if existing:
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

        user = User(email=normalized_email, password_hash=hash_password(password))
        db.add(user)
        db.commit()
        return user

    @staticmethod
    def login_user(db: Session, *, email: str, password: str, ip: str | None, user_agent: str | None) -> tuple[str, str, User]:
        normalized_email = normalize_email(email)
        user = db.scalar(select(User).where(User.email == normalized_email))

        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        if user.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="User is not active")

        if not verify_password(password, user.password_hash):
            user.failed_login_count += 1
            db.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

        user.failed_login_count = 0
        user.locked_until = None

        user_session = UserSession(user_id=user.id, ip=ip, user_agent=user_agent)
        db.add(user_session)
        db.flush()

        refresh_token_raw = generate_refresh_token()
        refresh_token_record = RefreshToken(
            session_id=user_session.id,
            user_id=user.id,
            token_hash=hash_refresh_token(refresh_token_raw),
            expires_at=now + timedelta(days=settings.refresh_token_ttl_days),
        )
        db.add(refresh_token_record)

        access_token = create_access_token(user_id=str(user.id), session_id=str(user_session.id))

        db.commit()

        return access_token, refresh_token_raw, user

    @staticmethod
    def refresh_tokens(db: Session, *, refresh_token_raw: str, ip: str | None, user_agent: str | None) -> tuple[str, str]:
        token_hash = hash_refresh_token(refresh_token_raw)
        token_record = db.scalar(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash).with_for_update()
        )

        if not token_record:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        now = now_utc()

        if token_record.revoked_at is not None:
            AuthService.revoke_session(db, session_id=token_record.session_id)
            db.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token reuse detected. Please login again")

        if token_record.expires_at <= now:
            db.execute(
                update(RefreshToken)
                .where(cast(RefreshToken.id, String) == str(token_record.id))
                .values(revoked_at=now)
            )
            db.commit()
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

        user_session = AuthService._get_session_by_id(db, token_record.session_id)
        if not user_session or user_session.revoked_at is not None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session is not active")

        user = AuthService._get_user_by_id(db, token_record.user_id)
        if not user or user.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is not active")

        db.execute(
            update(RefreshToken)
            .where(cast(RefreshToken.id, String) == str(token_record.id))
            .values(revoked_at=now)
        )

        new_refresh_token_raw = generate_refresh_token()
        new_refresh_token = RefreshToken(
            session_id=token_record.session_id,
            user_id=token_record.user_id,
            token_hash=hash_refresh_token(new_refresh_token_raw),
            expires_at=now + timedelta(days=settings.refresh_token_ttl_days),
            rotated_from=token_record.id,
        )
        db.add(new_refresh_token)

        session_updates: dict[str, object] = {"last_seen_at": now}
        if ip:
            session_updates["ip"] = ip
        if user_agent:
            session_updates["user_agent"] = user_agent

        db.execute(
            update(UserSession)
            .where(cast(UserSession.id, String) == str(token_record.session_id))
            .values(**session_updates)
        )

        access_token = create_access_token(
            user_id=str(token_record.user_id),
            session_id=str(token_record.session_id),
        )

        db.commit()
        return access_token, new_refresh_token_raw

    @staticmethod
    def revoke_session(db: Session, *, session_id: UUID) -> None:
        now = now_utc()
        db.execute(
            update(UserSession)
            .where(cast(UserSession.id, String) == str(session_id), UserSession.revoked_at.is_(None))
            .values(revoked_at=now)
        )
        db.execute(
            update(RefreshToken)
            .where(cast(RefreshToken.session_id, String) == str(session_id), RefreshToken.revoked_at.is_(None))
            .values(revoked_at=now)
        )

    @staticmethod
    def logout(db: Session, *, user_id: UUID, session_id: UUID, all_devices: bool) -> None:
        now = now_utc()

        if all_devices:
            db.execute(
                update(UserSession)
                .where(cast(UserSession.user_id, String) == str(user_id), UserSession.revoked_at.is_(None))
                .values(revoked_at=now)
            )

            db.execute(
                update(RefreshToken)
                .where(cast(RefreshToken.user_id, String) == str(user_id), RefreshToken.revoked_at.is_(None))
                .values(revoked_at=now)
            )

            db.commit()
            return

        AuthService.revoke_session(db, session_id=session_id)
        db.commit()

    @staticmethod
    def request_password_reset(db: Session, *, email: str) -> None:
        normalized_email = normalize_email(email)
        user = db.scalar(select(User).where(User.email == normalized_email))
        
        # We always return success to prevent email enumeration
        if not user or user.status != "ACTIVE":
            return
            
        token_raw = secrets.token_urlsafe(32)
        token_hash = hash_refresh_token(token_raw)  # We can re-use this hashing function
        
        now = now_utc()
        expires_at = now + timedelta(minutes=15)
        
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=expires_at,
        )
        db.add(reset_token)
        db.commit()
        
        send_password_reset_email(to_email=user.email, reset_token=token_raw)

    @staticmethod
    def reset_password(db: Session, *, token: str, new_password: str) -> None:
        token_hash = hash_refresh_token(token)
        
        reset_record = db.scalar(
            select(PasswordResetToken)
            .where(PasswordResetToken.token_hash == token_hash)
            .with_for_update()
        )
        
        if not reset_record or reset_record.used:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid or expired reset token")
            
        now = now_utc()
        if reset_record.expires_at <= now:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Reset token has expired")
            
        user = AuthService._get_user_by_id(db, reset_record.user_id)
        if not user or user.status != "ACTIVE":
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User account is not active")
            
        user.password_hash = hash_password(new_password)
        reset_record.used = True
        
        # Revoke all existing sessions to force user to re-login with new password
        AuthService.logout(db, user_id=user.id, session_id=None, all_devices=True)
        # Note: the above commits to db internally using the condition that we passed all_devices=True
        # Wait, our `logout` method commits but doing it like this is safe.
        
        db.commit()
