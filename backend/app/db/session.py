from collections.abc import Generator

from sqlalchemy import create_engine
from sqlalchemy import event
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import NullPool

from app.core.config import get_settings
from app.models.soet import AuditLog
from app.utils.request_context import get_actor_id, get_actor_role, get_ip_address

settings = get_settings()

# Use NullPool for serverless environments (Vercel) to avoid connection pooling issues
engine = create_engine(settings.database_url, poolclass=NullPool)
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False, expire_on_commit=False)


def _to_jsonable(value):
    if isinstance(value, (str, int, float, bool)) or value is None:
        return value
    if hasattr(value, "isoformat"):
        return value.isoformat()
    return str(value)


def _serialize_model(model) -> dict:
    data: dict = {}
    for column in model.__table__.columns:  # type: ignore[attr-defined]
        data[column.name] = _to_jsonable(getattr(model, column.name))
    return data


@event.listens_for(Session, "before_flush")
def capture_audit_logs(session: Session, flush_context, instances):  # noqa: ANN001, ARG001
    actor_id = get_actor_id()
    actor_role = get_actor_role()
    ip_address = get_ip_address()

    for obj in list(session.new):
        if isinstance(obj, AuditLog) or not hasattr(obj, "__table__"):
            continue
        session.add(
            AuditLog(
                action="INSERT",
                table_name=obj.__table__.name,
                record_id=str(getattr(obj, "id", "")) if getattr(obj, "id", None) else None,
                new_value=_serialize_model(obj),
                performed_by=actor_id,
                role=actor_role,
                ip_address=ip_address,
            )
        )

    for obj in list(session.dirty):
        if isinstance(obj, AuditLog) or not session.is_modified(obj, include_collections=False) or not hasattr(obj, "__table__"):
            continue
        session.add(
            AuditLog(
                action="UPDATE",
                table_name=obj.__table__.name,
                record_id=str(getattr(obj, "id", "")) if getattr(obj, "id", None) else None,
                new_value=_serialize_model(obj),
                performed_by=actor_id,
                role=actor_role,
                ip_address=ip_address,
            )
        )

    for obj in list(session.deleted):
        if isinstance(obj, AuditLog) or not hasattr(obj, "__table__"):
            continue
        session.add(
            AuditLog(
                action="DELETE",
                table_name=obj.__table__.name,
                record_id=str(getattr(obj, "id", "")) if getattr(obj, "id", None) else None,
                old_value=_serialize_model(obj),
                performed_by=actor_id,
                role=actor_role,
                ip_address=ip_address,
            )
        )


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
