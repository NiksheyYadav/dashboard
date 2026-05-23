import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class CounsellingNote(Base):
    __tablename__ = "counselling_notes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    corrective_action: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    student_response: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    improvement_plan: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    next_review_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
