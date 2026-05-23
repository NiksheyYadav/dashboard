import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, JSON, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class WarningLetter(Base):
    __tablename__ = "warning_letters"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    letter_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    mentor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    stage: Mapped[str] = mapped_column(String(30), nullable=False)  # advisory, parent_intimation, formal_warning, critical, detention
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    attendance_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # subject-wise attendance snapshot
    prior_interventions: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)  # counselling dates, warnings, etc.
    required_compliance: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    hod_approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    hod_approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    issue_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    parent_copy_sent: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    parent_copy_acknowledged: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    delivery_method: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)  # email, sms, print
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
