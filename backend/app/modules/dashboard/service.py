from sqlalchemy.orm import Session
from sqlalchemy import select, func
from uuid import UUID
from datetime import datetime

from app.models.student import Student
from app.models.subject import Subject
from app.models.notification import Notification
from app.models.mentor_mapping import MentorMapping
from app.models.leave_request import LeaveRequest
from app.models.arrangement_assignment import ArrangementAssignment
from app.models.timetable_slot import TimetableSlot
from app.modules.dashboard.schemas import DashboardMetricsOut, NotificationOut, ActionItemOut

class DashboardService:
    @staticmethod
    def get_hod_metrics(db: Session, user_id: str) -> DashboardMetricsOut:
        total_students = db.query(func.count(Student.id)).scalar() or 0
        return DashboardMetricsOut(
            attendance_rate=82.5,
            total_students=total_students,
            low_attendance_students=45,
            critical_students=12,
            pending_actions=5
        )

    @staticmethod
    def get_teacher_metrics(db: Session, user_id: str) -> dict:
        uid = UUID(user_id)
        
        assigned_subjects = db.query(func.count(Subject.id)).filter(
            Subject.assigned_teacher_id == uid
        ).scalar() or 0
        
        total_mentees = db.query(func.count(MentorMapping.id)).filter(
            MentorMapping.mentor_id == uid,
            MentorMapping.status == "active"
        ).scalar() or 0
        
        pending_leaves = db.query(func.count(LeaveRequest.id)).filter(
            LeaveRequest.teacher_id == uid,
            LeaveRequest.status.in_(["submitted", "arrangement_pending", "hod_pending"])
        ).scalar() or 0
        
        pending_arrangements = db.query(func.count(ArrangementAssignment.id)).filter(
            ArrangementAssignment.arrangement_teacher_id == uid,
            ArrangementAssignment.status == "pending"
        ).scalar() or 0
        
        today_dow = datetime.utcnow().weekday()  # 0=Mon
        today_classes = db.query(func.count(TimetableSlot.id)).filter(
            TimetableSlot.teacher_id == uid,
            TimetableSlot.day_of_week == today_dow,
            TimetableSlot.is_active == True
        ).scalar() or 0
        
        return {
            "assigned_subjects": assigned_subjects,
            "total_mentees": total_mentees,
            "pending_leaves": pending_leaves,
            "pending_arrangements": pending_arrangements,
            "today_classes": today_classes,
        }

    @staticmethod
    def get_notifications(db: Session, user_id: str):
        notifs = db.scalars(
            select(Notification)
            .where(Notification.user_id == UUID(user_id))
            .order_by(Notification.created_at.desc())
            .limit(20)
        ).all()
        return [NotificationOut.model_validate(n) for n in notifs]

    @staticmethod
    def get_action_items(db: Session, user_id: str):
        return [
            ActionItemOut(
                id="1",
                type="leave_approval",
                title="Leave Request - Dr. Sharma",
                description="Needs approval for 2 days casual leave.",
                status="pending",
                entity_id="leave-1"
            )
        ]
