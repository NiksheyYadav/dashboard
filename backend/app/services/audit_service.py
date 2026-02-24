from __future__ import annotations

import enum
import uuid
from datetime import date, datetime

from sqlalchemy import event, inspect
from sqlalchemy.orm import Session

from app.models.audit import AuditLog
from app.utils.request_context import get_current_org_id, get_current_user_id


def _collect_changes(instance) -> dict:
    changes = {}
    state = inspect(instance)
    for attr in state.attrs:
        history = state.attrs[attr.key].history
        if history.has_changes():
            changes[attr.key] = {
                "old": _serialize_value(history.deleted[0]) if history.deleted else None,
                "new": _serialize_value(history.added[0]) if history.added else None,
            }
    return changes


import decimal


def _serialize_value(value):
    if isinstance(value, uuid.UUID):
        return str(value)
    if isinstance(value, enum.Enum):
        return value.value
    if isinstance(value, (datetime, date)):
        return value.isoformat()
    if isinstance(value, decimal.Decimal):
        return float(value)
    return value


def _entity_id(instance) -> str | None:
    value = getattr(instance, "id", None)
    return str(value) if value else None


@event.listens_for(Session, "before_flush")
def add_audit_logs(session: Session, flush_context, instances):
    actor_user_id = get_current_user_id()
    default_org_id = get_current_org_id()

    for instance in session.new:
        if isinstance(instance, AuditLog):
            continue
        session.add(AuditLog(organization_id=getattr(instance, "organization_id", default_org_id), actor_user_id=actor_user_id, action="create", entity_name=instance.__class__.__name__, entity_id=_entity_id(instance), changes=None))

    for instance in session.dirty:
        if isinstance(instance, AuditLog):
            continue
        if not session.is_modified(instance, include_collections=False):
            continue
        session.add(AuditLog(organization_id=getattr(instance, "organization_id", default_org_id), actor_user_id=actor_user_id, action="update", entity_name=instance.__class__.__name__, entity_id=_entity_id(instance), changes=_collect_changes(instance)))

    for instance in session.deleted:
        if isinstance(instance, AuditLog):
            continue
        session.add(AuditLog(organization_id=getattr(instance, "organization_id", default_org_id), actor_user_id=actor_user_id, action="delete", entity_name=instance.__class__.__name__, entity_id=_entity_id(instance), changes=None))
