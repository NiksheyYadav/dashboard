import uuid
from datetime import datetime, timezone

from sqlalchemy import Boolean, Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import JSON
from app.db.base import Base


class FormDefinition(Base):
    __tablename__ = "form_definitions"

    id = Column(String(50), primary_key=True, default=lambda: f"form-{uuid.uuid4().hex[:8]}")
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=False, default="")
    fields = Column(JSON, nullable=False, default=list)
    target_course = Column(String(100), nullable=False, default="all")
    target_semester = Column(String(10), nullable=False, default="all")
    created_by = Column(String(150), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    deadline = Column(DateTime(timezone=True), nullable=False)
    is_active = Column(Boolean, default=True)


class FormResponse(Base):
    __tablename__ = "form_responses"

    id = Column(String(50), primary_key=True, default=lambda: f"resp-{uuid.uuid4().hex[:8]}")
    form_id = Column(String(50), nullable=False, index=True)
    student_id = Column(String(50), nullable=False)
    student_name = Column(String(150), nullable=False)
    answers = Column(JSON, nullable=False, default=dict)
    submitted_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
