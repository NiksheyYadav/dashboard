from __future__ import annotations

from collections import defaultdict

from sqlalchemy.orm import Session

from app.models.attendance import AttendanceRecord, AttendanceStatus
from app.models.cv import CVFile, CVStatus
from app.models.student import Student
from app.services.attendance_service import attendance_percentage

LOW_ATTENDANCE_THRESHOLD = 75.0


def build_dashboard_stats(db: Session, organization_id):
    students = db.query(Student).filter(Student.organization_id == organization_id, Student.is_deleted.is_(False)).all()
    total_students = len(students)

    records = db.query(AttendanceRecord).filter(AttendanceRecord.organization_id == organization_id).all()

    present_count = sum(1 for r in records if r.status == AttendanceStatus.present)
    absent_count = sum(1 for r in records if r.status == AttendanceStatus.absent)
    late_count = sum(1 for r in records if r.status == AttendanceStatus.late)
    excused_count = sum(1 for r in records if r.status == AttendanceStatus.excused)

    avg_attendance = attendance_percentage(present_count, len(records))

    by_student = defaultdict(lambda: {"present": 0, "total": 0})
    for record in records:
        by_student[record.student_id]["total"] += 1
        if record.status == AttendanceStatus.present:
            by_student[record.student_id]["present"] += 1

    low_attendance_count = sum(1 for _, stat in by_student.items() if attendance_percentage(stat["present"], stat["total"]) < LOW_ATTENDANCE_THRESHOLD)

    uploaded_cv_count = db.query(CVFile).filter(CVFile.organization_id == organization_id, CVFile.status == CVStatus.uploaded).count()

    week_present = defaultdict(int)
    week_total = defaultdict(int)
    for record in records:
        week_key = f"{record.session.session_date.isocalendar().year}-W{record.session.session_date.isocalendar().week:02d}"
        week_total[week_key] += 1
        if record.status == AttendanceStatus.present:
            week_present[week_key] += 1

    weekly_trend = [{"week": week, "percentage": attendance_percentage(week_present[week], week_total[week])} for week in sorted(week_total.keys())]

    return {
        "total_students": total_students,
        "avg_attendance_percentage": avg_attendance,
        "low_attendance_count": low_attendance_count,
        "cv_uploaded_count": uploaded_cv_count,
        "weekly_attendance_trend": weekly_trend,
        "attendance_distribution": {"present": present_count, "absent": absent_count, "late": late_count, "excused": excused_count},
    }
