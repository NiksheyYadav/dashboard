import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import Boolean, DateTime, ForeignKey, Integer, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Semester(Base):
    __tablename__ = "semesters"
    __table_args__ = (
        UniqueConstraint("number", "programme_id", "academic_year_id", name="uq_semester_prog_year"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    number: Mapped[int] = mapped_column(Integer, nullable=False)
    programme_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id"), nullable=False)
    academic_year_id: Mapped[Optional[uuid.UUID]] = mapped_column(
        UUID(as_uuid=True), ForeignKey("academic_years.id"), nullable=True
    )
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True, server_default="true")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
