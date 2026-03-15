from typing import Optional
from contextvars import ContextVar

from app.core.constants import REQUEST_ID_CTX_KEY

_request_id_ctx_var: ContextVar[Optional[str]] = ContextVar(REQUEST_ID_CTX_KEY, default=None)


def set_request_id(request_id: Optional[str]) -> None:
    _request_id_ctx_var.set(request_id)


def get_request_id() -> Optional[str]:
    return _request_id_ctx_var.get()
