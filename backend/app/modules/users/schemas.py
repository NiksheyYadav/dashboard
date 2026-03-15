from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime
from uuid import UUID

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: UUID
    email: EmailStr
    status: str
    department: str | None = None
    created_at: datetime
