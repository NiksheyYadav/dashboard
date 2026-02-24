from pydantic import BaseModel


class WeeklyAttendancePoint(BaseModel):
    week: str
    percentage: float


class AttendanceDistribution(BaseModel):
    present: int
    absent: int
    late: int
    excused: int


class DashboardStatsResponse(BaseModel):
    total_students: int
    avg_attendance_percentage: float
    low_attendance_count: int
    cv_uploaded_count: int
    weekly_attendance_trend: list[WeeklyAttendancePoint]
    attendance_distribution: AttendanceDistribution
