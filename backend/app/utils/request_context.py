from typing import Optional
from contextvars import ContextVar

from app.core.constants import REQUEST_ID_CTX_KEY

_request_id_ctx_var: ContextVar[Optional[str]] = ContextVar(REQUEST_ID_CTX_KEY, default=None)
_actor_id_ctx_var: ContextVar[Optional[str]] = ContextVar("actor_id", default=None)
_actor_role_ctx_var: ContextVar[Optional[str]] = ContextVar("actor_role", default=None)
_ip_ctx_var: ContextVar[Optional[str]] = ContextVar("actor_ip", default=None)


def set_request_id(request_id: Optional[str]) -> None:
    _request_id_ctx_var.set(request_id)


def get_request_id() -> Optional[str]:
    return _request_id_ctx_var.get()


def set_actor(actor_id: Optional[str], role: Optional[str]) -> None:
    _actor_id_ctx_var.set(actor_id)
    _actor_role_ctx_var.set(role)


def get_actor_id() -> Optional[str]:
    return _actor_id_ctx_var.get()


def get_actor_role() -> Optional[str]:
    return _actor_role_ctx_var.get()


def set_ip_address(ip_address: Optional[str]) -> None:
    _ip_ctx_var.set(ip_address)


def get_ip_address() -> Optional[str]:
    return _ip_ctx_var.get()
