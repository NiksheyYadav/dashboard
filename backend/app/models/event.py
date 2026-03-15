import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String
from app.db.base import Base


class Event(Base):
    __tablename__ = "events"

    id = Column(String(50), primary_key=True, default=lambda: str(uuid.uuid4().hex[:12]))
    event_name = Column(String(255), nullable=False)
    room_number = Column(String(100), nullable=False)
    date = Column(String(20), nullable=False)
    time_slot = Column(String(60), nullable=False)
    booked_by = Column(String(320), nullable=False)
    status = Column(String(20), nullable=False, default="pending")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
