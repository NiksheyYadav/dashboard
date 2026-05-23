import uuid
from datetime import date, datetime, time
from typing import Optional

from sqlalchemy import Date, DateTime, ForeignKey, String, Text, Time, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Activity(Base):
    __tablename__ = "activities"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    activity_type: Mapped[str] = mapped_column(String(50), nullable=False)  # seminar, workshop, industrial_visit, etc.
    coordinator_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    date: Mapped[date] = mapped_column(Date, nullable=False)
    start_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    end_time: Mapped[Optional[time]] = mapped_column(Time, nullable=True)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    proof_document: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    approval_status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default="pending")
    approved_by: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    approved_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
