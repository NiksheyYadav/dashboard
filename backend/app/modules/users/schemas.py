from pydantic import BaseModel, ConfigDict, EmailStr
from datetime import datetime

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: str
    email: EmailStr
    status: str
    department: str | None = None
    created_at: datetime
