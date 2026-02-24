from __future__ import annotations

from collections import defaultdict
from uuid import UUID

from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attendance import AttendanceRecord, AttendanceStatus
from app.models.student import Student
from app.models.user import User
from app.schemas.attendance import AttendanceSummaryResponse, AttendanceUploadResponse, StudentAttendanceResponse
from app.services.attendance_service import attendance_percentage, process_attendance_csv
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("/upload-csv", response_model=AttendanceUploadResponse)
def upload_attendance_csv(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod", "coordinator", "faculty"})),
):
    return process_attendance_csv(db=db, file=file, current_user=current_user)


@router.get("/summary", response_model=AttendanceSummaryResponse)
def attendance_summary(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = db.query(AttendanceRecord).filter(AttendanceRecord.organization_id == current_user.organization_id).all()

    present_count = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent_count = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late_count = sum(1 for r in records if r.status == AttendanceStatus.late)
    excused_count = sum(1 for r in records if r.status == AttendanceStatus.excused)

    return {
        "total_records": len(records),
        "present_count": present_count,
        "absent_count": absent_count,
        "late_count": late_count,
        "excused_count": excused_count,
        "attendance_percentage": attendance_percentage(present_count, len(records)),
    }


@router.get("/low-attendance")
def low_attendance(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = (
        db.query(AttendanceRecord)
        .join(Student, Student.id == AttendanceRecord.student_id)
        .filter(AttendanceRecord.organization_id == current_user.organization_id, Student.is_deleted.is_(False))
        .all()
    )

    by_student = defaultdict(lambda: {"present": 0, "total": 0})
    for record in records:
        by_student[record.student_id]["total"] += 1
        if record.status == AttendanceStatus.present:
            by_student[record.student_id]["present"] += 1

    result = []
    for student_id, stats in by_student.items():
        percentage = attendance_percentage(stats["present"], stats["total"])
        if percentage < 75:
            student = db.query(Student).filter(Student.id == student_id).first()
            result.append({"student_id": student_id, "name": f"{student.first_name} {student.last_name}" if student else "Unknown", "attendance_percentage": percentage})

    return result


@router.get("/student/{student_id}", response_model=StudentAttendanceResponse)
def attendance_by_student(student_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    records = (
        db.query(AttendanceRecord)
        .join(AttendanceRecord.session)
        .filter(AttendanceRecord.organization_id == current_user.organization_id, AttendanceRecord.student_id == student_id)
        .all()
    )

    present_count = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent_count = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late_count = sum(1 for r in records if r.status == AttendanceStatus.late)
    excused_count = sum(1 for r in records if r.status == AttendanceStatus.excused)

    points = [{"date": r.session.session_date, "course_code": r.session.course.code, "status": r.status.value} for r in records]

    return {
        "student_id": student_id,
        "summary": {
            "total_records": len(records),
            "present_count": present_count,
            "absent_count": absent_count,
            "late_count": late_count,
            "excused_count": excused_count,
            "attendance_percentage": attendance_percentage(present_count, len(records)),
        },
        "records": points,
    }
