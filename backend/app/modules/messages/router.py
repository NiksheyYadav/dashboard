from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.anonymous_message import AnonymousMessage
from app.modules.auth.dependencies import AuthContext, RequireRole, get_auth_context
from app.modules.messages.schemas import (
    AnonymousMessageCreate,
    AnonymousMessageResponse,
    PaginatedAnonymousMessagesResponse,
)

messages_router = APIRouter(prefix="/messages", tags=["messages"])


def _to_response(m: AnonymousMessage) -> AnonymousMessageResponse:
    return AnonymousMessageResponse(
        id=str(m.id),
        message=m.message,
        status=m.status,
        createdAt=m.created_at,
    )


@messages_router.post("/anonymous", response_model=AnonymousMessageResponse, status_code=201)
def create_anonymous_message(
    payload: AnonymousMessageCreate,
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> AnonymousMessageResponse:
    # Notice we purposely DO NOT save any reference to the authenticated user.
    # The `auth_context` dependency ensures they are logged in, but their identity is discarded.
    message = AnonymousMessage(message=payload.message)
    db.add(message)
    db.commit()
    db.refresh(message)
    return _to_response(message)


@messages_router.get("/anonymous", response_model=PaginatedAnonymousMessagesResponse)
def list_anonymous_messages(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    auth: AuthContext = Depends(RequireRole(["dean", "hod"])),
    db: Session = Depends(get_db),
) -> PaginatedAnonymousMessagesResponse:
    query = select(AnonymousMessage)

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    messages = db.scalars(
        query.order_by(AnonymousMessage.created_at.desc()).offset((page - 1) * limit).limit(limit)
    ).all()

    return PaginatedAnonymousMessagesResponse(
        data=[_to_response(m) for m in messages],
        total=total,
        page=page,
        limit=limit,
    )
