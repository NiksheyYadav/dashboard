from sqlalchemy.orm import Session
from sqlalchemy import select, func
from uuid import UUID

from app.models.student import Student
from app.models.notification import Notification
from app.modules.dashboard.schemas import DashboardMetricsOut, NotificationOut, ActionItemOut

class DashboardService:
    @staticmethod
    def get_hod_metrics(db: Session, user_id: str) -> DashboardMetricsOut:
        # Mock aggregation for phase 5
        total_students = db.query(func.count(Student.id)).scalar() or 0
        return DashboardMetricsOut(
            attendance_rate=82.5,
            total_students=total_students,
            low_attendance_students=45,
            critical_students=12,
            pending_actions=5
        )

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
        # Mock action items
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
