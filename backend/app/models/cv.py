from __future__ import annotations

import enum
import uuid

from sqlalchemy import Enum, ForeignKey, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, TimestampMixin, UUIDPrimaryKeyMixin


class CVStatus(str, enum.Enum):
    pending = "pending"
    uploaded = "uploaded"
    rejected = "rejected"


class CVFile(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "cv_files"

    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)
    uploaded_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    reviewed_by: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(String(500), nullable=False)
    status: Mapped[CVStatus] = mapped_column(Enum(CVStatus, name="cv_status"), nullable=False, default=CVStatus.pending)
    rejection_reason: Mapped[str | None] = mapped_column(String(500), nullable=True)

    student = relationship("Student", back_populates="cv_files")
