from typing import Optional, List, Dict, Any
from pydantic import BaseModel, ConfigDict
from datetime import date, datetime

# Counselling Notes
class CounsellingNoteCreate(BaseModel):
    student_id: str
    note: str
    corrective_action: Optional[str] = None
    student_response: Optional[str] = None
    improvement_plan: Optional[str] = None
    next_review_date: Optional[date] = None

class CounsellingNoteOut(BaseModel):
    id: str
    mentor_id: str
    student_id: str
    note: str
    corrective_action: Optional[str] = None
    student_response: Optional[str] = None
    improvement_plan: Optional[str] = None
    next_review_date: Optional[date] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Parent Communication
class ParentCommunicationCreate(BaseModel):
    student_id: str
    communication_type: str
    summary: str
    follow_up_date: Optional[date] = None

class ParentCommunicationOut(BaseModel):
    id: str
    mentor_id: str
    student_id: str
    communication_type: str
    summary: str
    follow_up_date: Optional[date] = None
    follow_up_done: bool
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Regularization Request
class RegularizationRequestCreate(BaseModel):
    student_id: str
    reason_category: str
    date: date
    slot_id: Optional[str] = None
    subject_id: Optional[str] = None
    proof_document: Optional[str] = None
    remarks: Optional[str] = None

class RegularizationRequestOut(BaseModel):
    id: str
    mentor_id: str
    student_id: str
    reason_category: str
    date: date
    slot_id: Optional[str] = None
    subject_id: Optional[str] = None
    proof_document: Optional[str] = None
    remarks: Optional[str] = None
    status: str
    hod_remarks: Optional[str] = None
    hod_decided_by: Optional[str] = None
    hod_decided_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

# Warning Letter
class WarningLetterGenerateRequest(BaseModel):
    student_id: str
    stage: str
    reason: str
    attendance_data: Optional[Dict[str, Any]] = None
    prior_interventions: Optional[Dict[str, Any]] = None
    required_compliance: Optional[str] = None

class WarningLetterOut(BaseModel):
    id: str
    letter_number: str
    student_id: str
    mentor_id: str
    stage: str
    reason: str
    issue_date: Optional[date] = None
    parent_copy_sent: bool
    parent_copy_acknowledged: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)
