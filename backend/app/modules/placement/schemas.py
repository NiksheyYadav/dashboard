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
    sl_no: int | None = None
    roll_no: str
    student_name: str
    photo_id: str | None = None
    gender: str | None = None
    type: str | None = None
    contact_no: str | None = None
    email: str | None = None
    x_result: str | None = None
    xii_result: str | None = None
    course: str | None = None
    branch: str | None = None
    designation: str | None = None
    company_name: str | None = None
    industry: str | None = None
    date_of_drive: str | None = None
    company_offers: str | None = None
    probation_duration: str | None = None
    stipend_per_month: str | None = None
    package: str | None = None
    offer_letter: str | None = None
    hr_contact: str | None = None
