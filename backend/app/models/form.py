from __future__ import annotations

import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, DateTime, Enum, ForeignKey, Integer, String, Text
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class FormStatus(str, enum.Enum):
    draft = "draft"
    active = "active"
    closed = "closed"


class FormFieldType(str, enum.Enum):
    text = "text"
    textarea = "textarea"
    radio = "radio"
    checkbox = "checkbox"
    dropdown = "dropdown"
    scale = "scale"


class FormDefinition(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "form_definitions"

    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    created_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    title: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    status: Mapped[FormStatus] = mapped_column(
        Enum(FormStatus, name="form_status"),
        nullable=False,
        default=FormStatus.draft,
    )
    target_course: Mapped[str | None] = mapped_column(String(100), nullable=True)
    target_semester: Mapped[int | None] = mapped_column(nullable=True)
    deadline: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    fields: Mapped[list | None] = mapped_column(JSONB, nullable=True, default=list)

    author = relationship("User", foreign_keys=[created_by])
    responses = relationship("FormResponse", back_populates="form", cascade="all, delete-orphan")


class FormResponse(Base, UUIDPrimaryKeyMixin, TimestampMixin):
    __tablename__ = "form_responses"

    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    form_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("form_definitions.id"), nullable=False)
    submitted_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)

    answers: Mapped[dict | None] = mapped_column(JSONB, nullable=True, default=dict)

    form = relationship("FormDefinition", back_populates="responses")
    submitter = relationship("User", foreign_keys=[submitted_by])
