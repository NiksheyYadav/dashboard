from typing import Optional, List, Dict, Any
from pydantic import BaseModel
from datetime import datetime

class DashboardMetricsOut(BaseModel):
    attendance_rate: float
    total_students: int
    low_attendance_students: int
    critical_students: int
    pending_actions: int

class NotificationOut(BaseModel):
    id: str
    type: str
    title: str
    message: str
    is_read: bool
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    created_at: datetime
    
class ActionItemOut(BaseModel):
    id: str
    type: str
    title: str
    description: str
    due_date: Optional[datetime] = None
    status: str
    entity_id: str
