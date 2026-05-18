import math
from typing import Any

from sqlalchemy import and_, func, or_, select
from sqlalchemy.orm import Session

from app.models.soet import AttendanceTransaction


def classify_risk(pct: float) -> str:
    if pct >= 75:
        return "Safe"
    if pct >= 65:
        return "Warning"
    if pct >= 50:
        return "Critical"
    return "Detention Risk"


def calculate_student_attendance(db: Session, student_id: str, subject_id: str) -> dict[str, Any]:
    valid_held = db.scalar(
        select(func.count(AttendanceTransaction.id)).where(
            AttendanceTransaction.student_id == student_id,
            AttendanceTransaction.subject_id == subject_id,
            AttendanceTransaction.class_type.in_(["regular", "arrangement", "extra"]),
            AttendanceTransaction.status != "no_class",
        )
    ) or 0

    attended = db.scalar(
        select(func.count(AttendanceTransaction.id)).where(
            AttendanceTransaction.student_id == student_id,
            AttendanceTransaction.subject_id == subject_id,
            AttendanceTransaction.status.in_(["present", "regularized"]),
            or_(
                AttendanceTransaction.approval_status.is_(None),
                AttendanceTransaction.approval_status == "approved",
            ),
        )
    ) or 0

    teacher_completion = db.scalar(
        select(func.count(AttendanceTransaction.id)).where(
            AttendanceTransaction.student_id == student_id,
            AttendanceTransaction.subject_id == subject_id,
            AttendanceTransaction.class_type.in_(["regular", "extra"]),
            AttendanceTransaction.status != "no_class",
        )
    ) or 0

    percentage = round((attended / valid_held) * 100, 1) if valid_held else 0.0
    shortage = max(0, math.ceil(0.75 * valid_held) - attended)

    return {
        "attended": attended,
        "valid_held": valid_held,
        "percentage": percentage,
        "teacher_completion_count": teacher_completion,
        "shortage": shortage,
        "risk": classify_risk(percentage),
    }
