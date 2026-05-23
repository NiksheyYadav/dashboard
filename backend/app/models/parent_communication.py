import uuid
from datetime import date, datetime
from typing import Optional

from sqlalchemy import Boolean, Date, DateTime, ForeignKey, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ParentCommunication(Base):
    __tablename__ = "parent_communications"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    mentor_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    communication_type: Mapped[str] = mapped_column(String(30), nullable=False)  # phone, email, meeting
    summary: Mapped[str] = mapped_column(Text, nullable=False)
    follow_up_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    follow_up_done: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False, server_default="false")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
