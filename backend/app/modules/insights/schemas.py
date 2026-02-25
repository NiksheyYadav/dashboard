from pydantic import BaseModel


class DashboardStatsResponse(BaseModel):
    totalStudents: int
    totalStudentsTrend: float
    cvsUploaded: int
    cvsUploadedLabel: str
    avgAttendance: float
    avgAttendanceTrend: float
    lowAttendance: int


class TopPerformerResponse(BaseModel):
    name: str
    attendance: float


class WeeklyTrendResponse(BaseModel):
    week: str
    attendance: float


class DistributionResponse(BaseModel):
    present: int
    absent: int
    leave: int


class StudentResponse(BaseModel):
    id: str
    name: str
    rollNo: str
    course: str
    department: str
    cvStatus: str
    attendancePercent: float
    semester: int
    status: str


class PaginatedStudentsResponse(BaseModel):
    data: list[StudentResponse]
    total: int
    page: int
    limit: int
