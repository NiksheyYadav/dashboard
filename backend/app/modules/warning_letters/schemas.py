import uuid
from datetime import date, datetime
from typing import Optional, Dict

from pydantic import BaseModel, ConfigDict


class WarningLetterBase(BaseModel):
    letter_number: str
    student_id: uuid.UUID
    mentor_id: uuid.UUID
    stage: str
    reason: str
    attendance_data: Optional[Dict] = None
    prior_interventions: Optional[Dict] = None
    required_compliance: Optional[str] = None
    hod_approved_by: Optional[uuid.UUID] = None
    hod_approved_at: Optional[datetime] = None
    issue_date: Optional[date] = None
    parent_copy_sent: bool = False
    parent_copy_acknowledged: bool = False
    delivery_method: Optional[str] = None


class WarningLetterOut(WarningLetterBase):
    id: uuid.UUID
    created_at: datetime
    updated_at: datetime
    student_name: str
    student_roll_no: str
    mentor_name: str
    status: str

    model_config = ConfigDict(from_attributes=True)


class WarningLetterApproveRequest(BaseModel):
    approved: bool


class WarningLetterDispatchRequest(BaseModel):
    delivery_method: str
