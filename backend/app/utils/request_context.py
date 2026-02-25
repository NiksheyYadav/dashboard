from contextvars import ContextVar

from app.core.constants import REQUEST_ID_CTX_KEY

_request_id_ctx_var: ContextVar[str | None] = ContextVar(REQUEST_ID_CTX_KEY, default=None)


def set_request_id(request_id: str | None) -> None:
    _request_id_ctx_var.set(request_id)


def get_request_id() -> str | None:
    return _request_id_ctx_var.get()
