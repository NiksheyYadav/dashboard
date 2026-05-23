from typing import Optional, List
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

class ArrangementCreate(BaseModel):
    slot_id: str
    arrangement_teacher_id: str
    subject_id: str
    section_id: str
    date: date

class ArrangementOut(BaseModel):
    id: str
    leave_request_id: str
    slot_id: str
    original_teacher_id: str
    arrangement_teacher_id: str
    subject_id: str
    section_id: str
    date: date
    status: str
    response_remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class LeaveRequestCreate(BaseModel):
    leave_type: str
    from_date: date
    to_date: date
    reason: str
    arrangements: List[ArrangementCreate]

class LeaveRequestOut(BaseModel):
    id: str
    teacher_id: str
    leave_type: str
    from_date: date
    to_date: date
    reason: str
    status: str
    hod_remarks: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    arrangements: List[ArrangementOut] = []

    model_config = ConfigDict(from_attributes=True)

class ArrangementResponse(BaseModel):
    status: str # "accepted" or "rejected"
    response_remarks: Optional[str] = None

class HodLeaveApproval(BaseModel):
    status: str # "approved" or "rejected"
    hod_remarks: Optional[str] = None

class ExtraClassCreate(BaseModel):
    subject_id: str
    section_id: str
    date: date
    start_time: str # HH:MM:SS
    end_time: str
    class_type: str # "extra" or "makeup"
    reason: str
    topic_covered: str
    room: Optional[str] = None

class ExtraClassOut(BaseModel):
    id: str
    teacher_id: str
    subject_id: str
    section_id: str
    date: date
    start_time: str
    end_time: str
    class_type: str
    reason: str
    topic_covered: str
    room: Optional[str] = None
    attendance_status: str
    is_conducted: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)
