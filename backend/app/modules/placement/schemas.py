from typing import Optional
from pydantic import BaseModel


class PlacementUploadError(BaseModel):
    row: int
    message: str


class PlacementUploadResponse(BaseModel):
    processed: int
    skipped: int
    errors: list[PlacementUploadError]


class PlacementRecordResponse(BaseModel):
    id: str
    sl_no: Optional[int] = None
    roll_no: str
    student_name: str
    photo_id: Optional[str] = None
    gender: Optional[str] = None
    type: Optional[str] = None
    contact_no: Optional[str] = None
    email: Optional[str] = None
    x_result: Optional[str] = None
    xii_result: Optional[str] = None
    course: Optional[str] = None
    branch: Optional[str] = None
    designation: Optional[str] = None
    company_name: Optional[str] = None
    industry: Optional[str] = None
    date_of_drive: Optional[str] = None
    company_offers: Optional[str] = None
    probation_duration: Optional[str] = None
    stipend_per_month: Optional[str] = None
    package: Optional[str] = None
    offer_letter: Optional[str] = None
    hr_contact: Optional[str] = None
