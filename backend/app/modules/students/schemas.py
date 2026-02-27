from pydantic import BaseModel


class StudentCreate(BaseModel):
    name: str
    rollNo: str
    course: str
    semester: int
    email: str | None = None
    phone: str | None = None


class StudentUpdate(BaseModel):
    name: str | None = None
    course: str | None = None
    semester: int | None = None
    email: str | None = None
    phone: str | None = None
    cv_status: str | None = None
    attendance_percent: float | None = None
    status: str | None = None


class StudentResponse(BaseModel):
    id: str
    name: str
    rollNo: str
    course: str
    department: str
    cvStatus: str
    attendancePercent: float
    semester: int
    email: str | None = None
    phone: str | None = None
    status: str


class PaginatedStudentsResponse(BaseModel):
    data: list[StudentResponse]
    total: int
    page: int
    limit: int
