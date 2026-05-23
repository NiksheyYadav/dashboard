import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Student(Base):
    __tablename__ = "students"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    roll_no: Mapped[str] = mapped_column(String(50), unique=True, index=True, nullable=False)
    course: Mapped[str] = mapped_column(String(100), nullable=False)
    department: Mapped[str] = mapped_column(String(100), nullable=False)
    semester: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    cv_status: Mapped[str] = mapped_column(String(20), nullable=False, default="PENDING", server_default="PENDING")
    attendance_percent: Mapped[float] = mapped_column(Float, nullable=False, default=0.0, server_default="0.0")
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="Active", server_default="Active")
    # New SOET fields
    batch: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    section_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("sections.id"), nullable=True)
    programme_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id"), nullable=True)
    semester_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("semesters.id"), nullable=True)
    mentor_id: Mapped[Optional[uuid.UUID]] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    parent_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    parent_phone: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    parent_email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
