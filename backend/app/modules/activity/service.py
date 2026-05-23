from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.models.activity import Activity
from app.models.activity_participant import ActivityParticipant
from app.models.attendance_transaction import AttendanceTransaction
from app.modules.activity.schemas import (
    ActivityCreate,
    ActivityOut,
    ParticipantBulkAdd,
    ParticipantOut,
    ActivityApprovalRequest,
)


class ActivityService:

    @staticmethod
    def create_activity(db: Session, user_id: str, data: ActivityCreate) -> ActivityOut:
        activity = Activity(
            name=data.name,
            activity_type=data.activity_type,
            coordinator_id=UUID(user_id),
            date=data.date,
            start_time=data.start_time,
            end_time=data.end_time,
            description=data.description,
            proof_document=data.proof_document,
            approval_status="pending",
        )
        db.add(activity)
        db.commit()
        db.refresh(activity)
        return ActivityOut.model_validate(activity)

    @staticmethod
    def list_activities(db: Session, user_id: Optional[str] = None) -> List[ActivityOut]:
        stmt = select(Activity).order_by(Activity.date.desc())
        if user_id:
            stmt = stmt.where(Activity.coordinator_id == UUID(user_id))
        activities = db.scalars(stmt).all()
        return [ActivityOut.model_validate(a) for a in activities]

    @staticmethod
    def add_participants(
        db: Session, activity_id: str, data: ParticipantBulkAdd
    ) -> List[ParticipantOut]:
        results = []
        for p in data.participants:
            participant = ActivityParticipant(
                activity_id=UUID(activity_id),
                student_id=p.student_id,
                attendance_credited=False,
                slot_id=p.slot_id,
            )
            db.add(participant)
            db.flush()
            db.refresh(participant)
            results.append(ParticipantOut.model_validate(participant))
        db.commit()
        return results

    @staticmethod
    def get_participants(db: Session, activity_id: str) -> List[ParticipantOut]:
        participants = db.scalars(
            select(ActivityParticipant).where(
                ActivityParticipant.activity_id == UUID(activity_id)
            )
        ).all()
        return [ParticipantOut.model_validate(p) for p in participants]

    @staticmethod
    def credit_attendance(db: Session, activity_id: str, marked_by: str) -> dict:
        """Credit attendance for all participants of an approved activity."""
        activity = db.get(Activity, UUID(activity_id))
        if not activity:
            raise ValueError("Activity not found")
        if activity.approval_status != "approved":
            raise ValueError("Activity must be approved before crediting attendance")

        participants = db.scalars(
            select(ActivityParticipant).where(
                ActivityParticipant.activity_id == UUID(activity_id),
                ActivityParticipant.attendance_credited == False,
            )
        ).all()

        credited = 0
        for p in participants:
            txn = AttendanceTransaction(
                student_id=p.student_id,
                subject_id=None,  # Activity attendance — no subject
                date=activity.date,
                slot_id=p.slot_id,
                status="present",
                marked_by=UUID(marked_by),
                class_type="activity",
                source_id=activity.id,
                approval_status="approved",
                remarks=f"Activity: {activity.name}",
            )
            db.add(txn)
            p.attendance_credited = True
            credited += 1

        db.commit()
        return {"credited": credited, "total_participants": len(participants) + credited}

    @staticmethod
    def approve_activity(
        db: Session, activity_id: str, approver_id: str, data: ActivityApprovalRequest
    ) -> ActivityOut:
        activity = db.get(Activity, UUID(activity_id))
        if not activity:
            raise ValueError("Activity not found")

        activity.approval_status = data.status
        activity.approved_by = UUID(approver_id)
        activity.approved_at = datetime.utcnow()
        db.commit()
        db.refresh(activity)
        return ActivityOut.model_validate(activity)
