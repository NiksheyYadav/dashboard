from typing import List, Optional
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class AttendanceRecordInput(BaseModel):
    student_id: str
    status: str
    remarks: Optional[str] = None

class MarkAttendanceRequest(BaseModel):
    subject_id: str
    date: date
    slot_id: Optional[str] = None
    class_type: str = "regular"
    source_id: Optional[str] = None
    records: List[AttendanceRecordInput]

class AttendanceTransactionOut(BaseModel):
    id: str
    student_id: str
    subject_id: str
    date: date
    slot_id: Optional[str] = None
    status: str
    marked_by: str
    class_type: str
    approval_status: str
    remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class AttendanceSummaryOut(BaseModel):
    student_id: str
    subject_id: str
    total_classes: int
    attended_classes: int
    absent_classes: int
    percentage: float
