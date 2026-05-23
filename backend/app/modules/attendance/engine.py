from typing import List, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import select, func, and_
from app.models.attendance_transaction import AttendanceTransaction
from app.core.enums import AttendanceStatusEnum
from app.modules.attendance.schemas import AttendanceSummaryOut

class AttendanceEngine:
    @staticmethod
    def calculate_student_subject_summary(db: Session, student_id: str, subject_id: str) -> AttendanceSummaryOut:
        """Calculate attendance summary for a specific student and subject."""
        records = db.scalars(
            select(AttendanceTransaction).where(
                and_(
                    AttendanceTransaction.student_id == student_id,
                    AttendanceTransaction.subject_id == subject_id,
                    AttendanceTransaction.status != AttendanceStatusEnum.NO_CLASS_CONDUCTED.value
                )
            )
        ).all()

        total = len(records)
        attended = sum(1 for r in records if r.status == AttendanceStatusEnum.PRESENT.value)
        absent = sum(1 for r in records if r.status == AttendanceStatusEnum.ABSENT.value)
        
        percentage = (attended / total * 100.0) if total > 0 else 0.0

        return AttendanceSummaryOut(
            student_id=student_id,
            subject_id=subject_id,
            total_classes=total,
            attended_classes=attended,
            absent_classes=absent,
            percentage=round(percentage, 2)
        )

    @staticmethod
    def calculate_student_overall_summary(db: Session, student_id: str) -> Dict[str, Any]:
        """Calculate overall attendance summary across all subjects for a student."""
        records = db.scalars(
            select(AttendanceTransaction).where(
                and_(
                    AttendanceTransaction.student_id == student_id,
                    AttendanceTransaction.status != AttendanceStatusEnum.NO_CLASS_CONDUCTED.value
                )
            )
        ).all()

        total = len(records)
        attended = sum(1 for r in records if r.status == AttendanceStatusEnum.PRESENT.value)
        absent = sum(1 for r in records if r.status == AttendanceStatusEnum.ABSENT.value)
        
        percentage = (attended / total * 100.0) if total > 0 else 0.0
        
        # Breakdown by subject
        subject_breakdown = {}
        for r in records:
            sid = str(r.subject_id)
            if sid not in subject_breakdown:
                subject_breakdown[sid] = {"total": 0, "attended": 0, "absent": 0}
            
            subject_breakdown[sid]["total"] += 1
            if r.status == AttendanceStatusEnum.PRESENT.value:
                subject_breakdown[sid]["attended"] += 1
            elif r.status == AttendanceStatusEnum.ABSENT.value:
                subject_breakdown[sid]["absent"] += 1
                
        for sid, data in subject_breakdown.items():
            data["percentage"] = round((data["attended"] / data["total"] * 100.0) if data["total"] > 0 else 0.0, 2)

        return {
            "student_id": student_id,
            "overall_total": total,
            "overall_attended": attended,
            "overall_absent": absent,
            "overall_percentage": round(percentage, 2),
            "subject_breakdown": subject_breakdown
        }
