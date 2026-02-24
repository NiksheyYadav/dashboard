from __future__ import annotations

from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.attendance import AttendanceRecord, AttendanceStatus
from app.models.cv import CVFile, CVStatus
from app.models.fee import FeeRecord, FeeStatus
from app.models.student import Student
from app.models.user import User
from app.services.attendance_service import attendance_percentage
from app.utils.deps import require_roles

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("/attendance")
def attendance_report(department_id: str | None = Query(default=None), semester: int | None = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod", "coordinator"}))):
    query = db.query(AttendanceRecord).join(Student, Student.id == AttendanceRecord.student_id).filter(AttendanceRecord.organization_id == current_user.organization_id, Student.is_deleted.is_(False))
    if department_id:
        query = query.filter(Student.department_id == department_id)
    records = query.all()

    by_student = defaultdict(lambda: {"present": 0, "total": 0, "name": "", "roll": ""})
    for record in records:
        sid = record.student_id
        by_student[sid]["total"] += 1
        if record.status == AttendanceStatus.present:
            by_student[sid]["present"] += 1
        by_student[sid]["name"] = f"{record.student.first_name} {record.student.last_name}"
        by_student[sid]["roll"] = record.student.roll_number

    report_rows = sorted([{"student_id": str(sid), "name": stats["name"], "roll_number": stats["roll"], "total_classes": stats["total"], "present": stats["present"], "absent": stats["total"] - stats["present"], "attendance_percentage": attendance_percentage(stats["present"], stats["total"])} for sid, stats in by_student.items()], key=lambda x: x["name"])

    total = len(records)
    present_total = sum(1 for r in records if r.status == AttendanceStatus.present)

    return {"report_type": "attendance", "generated_at": date.today().isoformat(), "summary": {"total_students": len(by_student), "total_records": total, "overall_attendance": attendance_percentage(present_total, total), "below_75_count": sum(1 for r in report_rows if r["attendance_percentage"] < 75)}, "data": report_rows}


@router.get("/fees")
def fees_report(academic_year: str | None = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod", "coordinator"}))):
    query = db.query(FeeRecord).filter(FeeRecord.organization_id == current_user.organization_id, FeeRecord.is_deleted.is_(False))
    if academic_year:
        query = query.filter(FeeRecord.academic_year == academic_year)
    fees = query.all()

    by_type = defaultdict(lambda: {"total": 0, "collected": 0, "count": 0})
    for fee in fees:
        ft = fee.fee_type.value
        by_type[ft]["total"] += float(fee.amount)
        by_type[ft]["collected"] += float(fee.paid_amount)
        by_type[ft]["count"] += 1

    total_amount = sum(float(f.amount) for f in fees)
    total_collected = sum(float(f.paid_amount) for f in fees)

    return {"report_type": "fees", "generated_at": date.today().isoformat(), "summary": {"total_records": len(fees), "total_amount": total_amount, "total_collected": total_collected, "total_pending": total_amount - total_collected, "collection_rate": round((total_collected / total_amount * 100), 1) if total_amount > 0 else 0}, "by_type": [{"fee_type": ft, "count": stats["count"], "total_amount": stats["total"], "collected": stats["collected"], "pending": stats["total"] - stats["collected"]} for ft, stats in by_type.items()]}


@router.get("/cv-status")
def cv_status_report(db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod", "coordinator"}))):
    org_id = current_user.organization_id
    total_students = db.query(Student).filter(Student.organization_id == org_id, Student.is_deleted.is_(False)).count()
    cvs = db.query(CVFile).filter(CVFile.organization_id == org_id).all()
    uploaded = sum(1 for c in cvs if c.status == CVStatus.uploaded)
    pending = sum(1 for c in cvs if c.status == CVStatus.pending)
    rejected = sum(1 for c in cvs if c.status == CVStatus.rejected)
    students_with_cv = len(set(c.student_id for c in cvs))

    return {"report_type": "cv_status", "generated_at": date.today().isoformat(), "summary": {"total_students": total_students, "students_with_cv": students_with_cv, "students_without_cv": total_students - students_with_cv, "cv_coverage_percentage": round((students_with_cv / total_students * 100), 1) if total_students > 0 else 0}, "cv_status": {"total": len(cvs), "approved": uploaded, "pending_review": pending, "rejected": rejected}}
