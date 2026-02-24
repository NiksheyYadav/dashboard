from uuid import UUID

from pydantic import BaseModel, ConfigDict, EmailStr


class StudentBase(BaseModel):
    first_name: str
    last_name: str
    roll_number: str
    email: EmailStr | None = None
    department_id: UUID | None = None
    semester_id: UUID | None = None


class StudentCreate(StudentBase):
    pass


class StudentUpdate(BaseModel):
    first_name: str | None = None
    last_name: str | None = None
    roll_number: str | None = None
    email: EmailStr | None = None
    department_id: UUID | None = None
    semester_id: UUID | None = None


class StudentResponse(StudentBase):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    organization_id: UUID
