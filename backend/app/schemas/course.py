from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CourseCreate(BaseModel):
    name: str
    code: str
    credits: str | None = None
    department_id: UUID | None = None
    academic_year_id: UUID | None = None
    semester_id: UUID | None = None


class CourseResponse(CourseCreate):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
