from typing import Optional
from pydantic import BaseModel
from datetime import date
from enum import Enum

class ReportTypeEnum(str, Enum):
    ATTENDANCE_SUMMARY = "attendance_summary"
    LOW_ATTENDANCE = "low_attendance"
    LEAVE_SUMMARY = "leave_summary"
    MENTOR_REPORT = "mentor_report"

class ReportRequest(BaseModel):
    report_type: ReportTypeEnum
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    programme_id: Optional[str] = None
    section_id: Optional[str] = None
