from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    priority: str = "normal"
    target_course: str | None = None
    target_semester: int | None = None


class AnnouncementUpdate(BaseModel):
    title: str | None = None
    message: str | None = None
    priority: str | None = None
    target_course: str | None = None
    target_semester: int | None = None


class AnnouncementResponse(BaseModel):
    id: UUID
    title: str
    message: str
    priority: str
    target_course: str | None
    target_semester: int | None
    created_by: UUID
    author_name: str | None = None
    author_role: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}
