from __future__ import annotations

from collections import defaultdict

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

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/overview")
def analytics_overview(db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    org_id = current_user.organization_id
    total_students = db.query(Student).filter(Student.organization_id == org_id, Student.is_deleted.is_(False)).count()

    records = db.query(AttendanceRecord).filter(AttendanceRecord.organization_id == org_id).all()
    present = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late = sum(1 for r in records if r.status == AttendanceStatus.late)
    excused = sum(1 for r in records if r.status == AttendanceStatus.excused)
    avg_attendance = attendance_percentage(present, len(records))

    by_student = defaultdict(lambda: {"present": 0, "total": 0})
    for record in records:
        by_student[record.student_id]["total"] += 1
        if record.status == AttendanceStatus.present:
            by_student[record.student_id]["present"] += 1

    low_count = sum(1 for _, s in by_student.items() if attendance_percentage(s["present"], s["total"]) < 75)
    good_count = sum(1 for _, s in by_student.items() if attendance_percentage(s["present"], s["total"]) >= 75)

    cv_total = db.query(CVFile).filter(CVFile.organization_id == org_id).count()
    cv_uploaded = db.query(CVFile).filter(CVFile.organization_id == org_id, CVFile.status == CVStatus.uploaded).count()
    cv_pending = db.query(CVFile).filter(CVFile.organization_id == org_id, CVFile.status == CVStatus.pending).count()
    cv_rejected = db.query(CVFile).filter(CVFile.organization_id == org_id, CVFile.status == CVStatus.rejected).count()

    fees = db.query(FeeRecord).filter(FeeRecord.organization_id == org_id, FeeRecord.is_deleted.is_(False)).all()
    total_fees = sum(float(f.amount) for f in fees)
    collected_fees = sum(float(f.paid_amount) for f in fees)
    fee_paid = sum(1 for f in fees if f.status == FeeStatus.paid)
    fee_pending = sum(1 for f in fees if f.status == FeeStatus.pending)
    fee_overdue = sum(1 for f in fees if f.status == FeeStatus.overdue)

    week_present = defaultdict(int)
    week_total = defaultdict(int)
    for record in records:
        week_key = f"{record.session.session_date.isocalendar().year}-W{record.session.session_date.isocalendar().week:02d}"
        week_total[week_key] += 1
        if record.status == AttendanceStatus.present:
            week_present[week_key] += 1

    weekly_trend = [{"week": w, "percentage": attendance_percentage(week_present[w], week_total[w])} for w in sorted(week_total.keys())][-12:]

    return {
        "students": {"total": total_students, "with_good_attendance": good_count, "with_low_attendance": low_count},
        "attendance": {"total_records": len(records), "present": present, "absent": absent, "late": late, "excused": excused, "average_percentage": avg_attendance, "weekly_trend": weekly_trend},
        "cv": {"total": cv_total, "approved": cv_uploaded, "pending": cv_pending, "rejected": cv_rejected},
        "fees": {"total_amount": total_fees, "collected": collected_fees, "pending_amount": total_fees - collected_fees, "paid_count": fee_paid, "pending_count": fee_pending, "overdue_count": fee_overdue},
    }


@router.get("/attendance-by-department")
def attendance_by_department(db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    records = db.query(AttendanceRecord).join(Student, Student.id == AttendanceRecord.student_id).filter(AttendanceRecord.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).all()

    by_dept = defaultdict(lambda: {"present": 0, "total": 0})
    for record in records:
        dept_id = str(record.student.department_id) if record.student.department_id else "unassigned"
        by_dept[dept_id]["total"] += 1
        if record.status == AttendanceStatus.present:
            by_dept[dept_id]["present"] += 1

    return [{"department_id": dept_id, "total_records": stats["total"], "present_count": stats["present"], "attendance_percentage": attendance_percentage(stats["present"], stats["total"])} for dept_id, stats in by_dept.items()]


@router.get("/top-students")
def top_students(limit: int = Query(default=10, le=50), db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    records = db.query(AttendanceRecord).join(Student, Student.id == AttendanceRecord.student_id).filter(AttendanceRecord.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).all()

    by_student = defaultdict(lambda: {"present": 0, "total": 0, "name": "", "roll": ""})
    for record in records:
        sid = record.student_id
        by_student[sid]["total"] += 1
        if record.status == AttendanceStatus.present:
            by_student[sid]["present"] += 1
        by_student[sid]["name"] = f"{record.student.first_name} {record.student.last_name}"
        by_student[sid]["roll"] = record.student.roll_number

    ranked = sorted([{"student_id": sid, "name": stats["name"], "roll_number": stats["roll"], "attendance_percentage": attendance_percentage(stats["present"], stats["total"]), "total_classes": stats["total"]} for sid, stats in by_student.items()], key=lambda x: x["attendance_percentage"], reverse=True)

    return ranked[:limit]
