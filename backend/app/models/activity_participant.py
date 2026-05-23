import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ActivityParticipant(Base):
    __tablename__ = "activity_participants"
    __table_args__ = (
        UniqueConstraint("activity_id", "student_id", name="uq_activity_student"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    activity_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("activities.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    attendance_credited: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    slot_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("timetable_slots.id"), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
