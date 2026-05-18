from datetime import date
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field


class AttendanceMarkItem(BaseModel):
    model_config = ConfigDict(extra="forbid")
    student_id: str
    status: str = Field(pattern="^(present|absent|regularized)$")
    remarks: Optional[str] = None


class BulkAttendanceMarkRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    subject_id: str
    slot_id: str
    date: date
    class_type: str = "regular"
    source: Optional[str] = None
    students: list[AttendanceMarkItem]


class NoClassRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    subject_id: str
    slot_id: str
    date: date
    remarks: Optional[str] = None


class LeaveApplyRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    leave_type: str
    from_date: date
    to_date: date
    reason: Optional[str] = None


class ArrangementAssignRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    leave_request_id: str
    slot_id: str
    subject_id: str
    section_id: str
    original_teacher_id: str
    arrangement_teacher_id: str


class ArrangementDecisionRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    decision: str = Field(pattern="^(accepted|rejected)$")


class ExtraClassCreateRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    subject_id: str
    section_id: str
    date: date
    slot_id: str
    class_type: str = Field(pattern="^(extra|makeup)$")
    reason: Optional[str] = None
    topic_covered: Optional[str] = None


class MentorNoteRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    student_id: str
    note: str
    student_response: Optional[str] = None
    corrective_action: Optional[str] = None
    next_review_date: Optional[date] = None


class ParentCommunicationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")
    student_id: str
    channel: str
    summary: str
    followup_date: Optional[date] = None


class RegularizationRequestCreate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    student_id: str
    category: str
    date_from: date
    date_to: date
    reason: str
    proof_url: Optional[str] = None
