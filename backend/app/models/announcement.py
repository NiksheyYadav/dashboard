import uuid
from datetime import datetime, timezone

from sqlalchemy import Column, DateTime, String, Text
from app.db.base import Base


class Announcement(Base):
    __tablename__ = "announcements"

    id = Column(String(50), primary_key=True, default=lambda: f"ann-{uuid.uuid4().hex[:8]}")
    title = Column(String(255), nullable=False)
    message = Column(Text, nullable=False)
    author = Column(String(150), nullable=False)
    author_role = Column(String(50), nullable=False)
    target_course = Column(String(100), nullable=False, default="all")
    target_semester = Column(String(10), nullable=False, default="all")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    priority = Column(String(20), nullable=False, default="normal")
