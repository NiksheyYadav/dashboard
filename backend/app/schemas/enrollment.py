from uuid import UUID

from pydantic import BaseModel, ConfigDict


class EnrollmentCreate(BaseModel):
    student_id: UUID
    course_id: UUID


class EnrollmentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
    student_id: UUID
    course_id: UUID
