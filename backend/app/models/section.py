import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, String, UniqueConstraint, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (
        UniqueConstraint("name", "semester_id", "programme_id", name="uq_section_sem_prog"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(50), nullable=False)
    semester_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("semesters.id"), nullable=False)
    programme_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("programmes.id"), nullable=False)
    max_students: Mapped[Optional[int]] = mapped_column(Integer, nullable=True, default=60)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
