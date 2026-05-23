import uuid
from datetime import datetime, time
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, String, Time, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class TimetableSlot(Base):
    __tablename__ = "timetable_slots"
    __table_args__ = (
        UniqueConstraint("day_of_week", "slot_number", "section_id", name="uq_slot_day_section"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    day_of_week: Mapped[int] = mapped_column(Integer, nullable=False)  # 0=Mon..6=Sun
    slot_number: Mapped[int] = mapped_column(Integer, nullable=False)
    start_time: Mapped[time] = mapped_column(Time, nullable=False)
    end_time: Mapped[time] = mapped_column(Time, nullable=False)
    subject_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("subjects.id"), nullable=False)
    section_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sections.id"), nullable=False)
    teacher_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    room: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    lecture_type: Mapped[str] = mapped_column(String(30), nullable=False, default="theory", server_default="theory")
    lab_group: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
