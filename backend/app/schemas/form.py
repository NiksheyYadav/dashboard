from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel


class FormFieldSchema(BaseModel):
    id: str
    type: str
    label: str
    required: bool = False
    options: list[dict] | None = None
    scale_min: int | None = None
    scale_max: int | None = None


class FormCreate(BaseModel):
    title: str
    description: str | None = None
    status: str = "draft"
    target_course: str | None = None
    target_semester: int | None = None
    deadline: datetime | None = None
    fields: list[FormFieldSchema] = []


class FormUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    status: str | None = None
    target_course: str | None = None
    target_semester: int | None = None
    deadline: datetime | None = None
    fields: list[FormFieldSchema] | None = None


class FormResponse(BaseModel):
    id: UUID
    title: str
    description: str | None
    status: str
    target_course: str | None
    target_semester: int | None
    deadline: datetime | None
    fields: list | None
    created_by: UUID
    author_name: str | None = None
    response_count: int = 0
    created_at: datetime

    model_config = {"from_attributes": True}


class FormSubmitRequest(BaseModel):
    answers: dict


class FormSubmissionResponse(BaseModel):
    id: UUID
    form_id: UUID
    submitted_by: UUID
    answers: dict | None
    created_at: datetime

    model_config = {"from_attributes": True}
