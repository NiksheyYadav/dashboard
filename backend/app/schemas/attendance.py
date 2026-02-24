from datetime import date
from uuid import UUID

from pydantic import BaseModel


class AttendanceSummaryResponse(BaseModel):
    total_records: int
    present_count: int
    absent_count: int
    late_count: int
    excused_count: int
    attendance_percentage: float


class StudentAttendancePoint(BaseModel):
    date: date
    course_code: str
    status: str


class StudentAttendanceResponse(BaseModel):
    student_id: UUID
    summary: AttendanceSummaryResponse
    records: list[StudentAttendancePoint]


class AttendanceUploadResponse(BaseModel):
    upload_id: UUID
    processed_rows: int
    created_records: int
    skipped_records: int
    errors: list[str]
