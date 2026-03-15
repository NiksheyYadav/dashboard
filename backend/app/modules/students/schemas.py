from typing import Optional
from pydantic import BaseModel


class StudentCreate(BaseModel):
    name: str
    rollNo: str
    course: str
    semester: int
    email: Optional[str] = None
    phone: Optional[str] = None


class StudentUpdate(BaseModel):
    name: Optional[str] = None
    course: Optional[str] = None
    semester: Optional[int] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    cv_status: Optional[str] = None
    attendance_percent: Optional[float] = None
    status: Optional[str] = None


class StudentResponse(BaseModel):
    id: str
    name: str
    rollNo: str
    course: str
    department: str
    cvStatus: str
    attendancePercent: float
    semester: int
    email: Optional[str] = None
    phone: Optional[str] = None
    status: str


class PaginatedStudentsResponse(BaseModel):
    data: list[StudentResponse]
    total: int
    page: int
    limit: int
