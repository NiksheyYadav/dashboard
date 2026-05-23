from typing import Optional, List
from pydantic import BaseModel
from datetime import date, time, datetime
from uuid import UUID


class ActivityCreate(BaseModel):
    name: str
    activity_type: str  # sports, cultural, technical, seminar, etc.
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    description: Optional[str] = None
    proof_document: Optional[str] = None


class ActivityOut(BaseModel):
    id: UUID
    name: str
    activity_type: str
    coordinator_id: UUID
    date: date
    start_time: Optional[time] = None
    end_time: Optional[time] = None
    description: Optional[str] = None
    proof_document: Optional[str] = None
    approval_status: str
    approved_by: Optional[UUID] = None
    approved_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ParticipantAdd(BaseModel):
    student_id: UUID
    slot_id: Optional[UUID] = None


class ParticipantBulkAdd(BaseModel):
    participants: List[ParticipantAdd]


class ParticipantOut(BaseModel):
    id: UUID
    activity_id: UUID
    student_id: UUID
    attendance_credited: bool
    slot_id: Optional[UUID] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class CreditAttendanceRequest(BaseModel):
    """Request to credit attendance for all participants of an activity."""
    slot_id: Optional[UUID] = None  # Optional: override slot for crediting


class ActivityApprovalRequest(BaseModel):
    """HoD/Dean approval or rejection of an activity."""
    status: str  # "approved" or "rejected"
    remarks: Optional[str] = None
