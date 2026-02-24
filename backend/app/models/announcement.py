from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import DateTime, Enum, ForeignKey, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class AnnouncementPriority(str, enum.Enum):
    normal = "normal"
    important = "important"
    urgent = "urgent"


class Announcement(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    """Announcements created by Dean/HOD for the organization."""

    __tablename__ = "announcements"

    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    priority: Mapped[AnnouncementPriority] = mapped_column(
        Enum(AnnouncementPriority, name="announcement_priority"),
        nullable=False,
        default=AnnouncementPriority.normal,
    )
    target_course: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_semester: Mapped[int | None] = mapped_column(nullable=True)

    author = relationship("User", foreign_keys=[created_by])
