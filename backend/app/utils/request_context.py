from __future__ import annotations

import uuid
from contextvars import ContextVar


_current_user_id: ContextVar[uuid.UUID | None] = ContextVar("current_user_id", default=None)
_current_org_id: ContextVar[uuid.UUID | None] = ContextVar("current_org_id", default=None)


def set_request_context(user_id: uuid.UUID | None, org_id: uuid.UUID | None) -> None:
    _current_user_id.set(user_id)
    _current_org_id.set(org_id)


def get_current_user_id() -> uuid.UUID | None:
    return _current_user_id.get()


def get_current_org_id() -> uuid.UUID | None:
    return _current_org_id.get()
