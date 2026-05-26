from typing import List, Optional, Dict, Any
from datetime import date
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, get_auth_context, RequireRole
from app.modules.attendance.schemas import MarkAttendanceRequest, AttendanceTransactionOut, AttendanceSummaryOut
from app.modules.attendance.service import AttendanceService
from app.modules.attendance.engine import AttendanceEngine

attendance_router = APIRouter(prefix="/attendance", tags=["attendance"])

@attendance_router.post("/mark", response_model=List[AttendanceTransactionOut])
def mark_attendance(
    request: MarkAttendanceRequest,
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher"])),
    db: Session = Depends(get_db)
):
    """Mark attendance for a given slot/subject/date."""
    return AttendanceService.mark_attendance(db, request, str(auth.user.id))

@attendance_router.get("/session", response_model=List[AttendanceTransactionOut])
def get_session_attendance(
    subject_id: str,
    date: date,
    slot_id: Optional[str] = None,
    _: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher"])),
    db: Session = Depends(get_db)
):
    """Get already marked attendance for a specific session."""
    return AttendanceService.get_attendance_for_session(db, subject_id, date, slot_id)

@attendance_router.get("/summary/student/{student_id}/subject/{subject_id}", response_model=AttendanceSummaryOut)
def get_student_subject_summary(
    student_id: str,
    subject_id: str,
    _: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor"])),
    db: Session = Depends(get_db)
):
    """Get attendance summary for a student in a specific subject."""
    return AttendanceEngine.calculate_student_subject_summary(db, student_id, subject_id)

@attendance_router.get("/summary/student/{student_id}")
def get_student_overall_summary(
    student_id: str,
    _: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor"])),
    db: Session = Depends(get_db)
):
    """Get overall attendance summary for a student."""
    return AttendanceEngine.calculate_student_overall_summary(db, student_id)

@attendance_router.get("/detention-list")
def get_detention_list(
    threshold: float = 75.0,
    _: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor"])),
    db: Session = Depends(get_db)
):
    """Get students below attendance threshold."""
    return AttendanceEngine.get_detention_list(db, threshold)
