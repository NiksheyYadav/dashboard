from typing import Optional
from uuid import UUID

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError
from sqlalchemy import String, cast, select
from sqlalchemy.orm import Session

from app.core.security import decode_access_token
from app.db.session import get_db
from app.models.session import Session as UserSession
from app.models.user import User
from app.utils.request_context import set_actor

bearer_scheme = HTTPBearer(auto_error=False)


class AuthContext:
    def __init__(self, *, user: User, session: UserSession) -> None:
        self.user = user
        self.session = session
        self.roles = user.roles or []

def get_auth_context(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> AuthContext:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing bearer token")

    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token") from None

    user_id = payload.get("sub")
    session_id = payload.get("sid")
    if not user_id or not session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token payload")

    user_session = db.scalar(select(UserSession).where(cast(UserSession.id, String) == str(UUID(session_id))))
    if not user_session or user_session.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Session is not active")

    user = db.scalar(select(User).where(cast(User.id, String) == str(UUID(user_id))))
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status != "ACTIVE":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User is not active")

    auth = AuthContext(user=user, session=user_session)
    actor_role = ",".join(auth.roles) if auth.roles else None
    set_actor(str(user.id), actor_role)
    return auth


def get_current_user(auth: AuthContext = Depends(get_auth_context)) -> User:
    return auth.user


class RequireRole:
    def __init__(self, allowed_roles: list[str]) -> None:
        self.allowed_roles = [role.upper() for role in allowed_roles]

    def __call__(self, auth: AuthContext = Depends(get_auth_context)) -> AuthContext:
        user_roles = {role.upper() for role in (auth.user.roles or [])}
        if not user_roles.intersection(set(self.allowed_roles)):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Requires one of: {', '.join(self.allowed_roles)}",
            )
        return auth
