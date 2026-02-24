from uuid import UUID

from pydantic import BaseModel, ConfigDict


class CVResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: UUID
    student_id: UUID
    file_name: str
    file_path: str
    status: str
    rejection_reason: str | None


class CVReviewRequest(BaseModel):
    reason: str | None = None
