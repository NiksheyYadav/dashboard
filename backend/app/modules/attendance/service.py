from typing import List, Optional
from datetime import date
from uuid import UUID
from fastapi import HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import select, and_
from sqlalchemy.exc import IntegrityError

from app.models.attendance_transaction import AttendanceTransaction
from app.modules.attendance.schemas import MarkAttendanceRequest, AttendanceTransactionOut
from app.core.enums import AttendanceStatusEnum

class AttendanceService:
    @staticmethod
    def mark_attendance(db: Session, request: MarkAttendanceRequest, marked_by_id: str) -> List[AttendanceTransactionOut]:
        from datetime import datetime, timedelta
        attendance_date = request.date
        if isinstance(attendance_date, str):
            attendance_date = date.fromisoformat(attendance_date)
        cutoff = datetime.combine(attendance_date + timedelta(days=1), datetime.max.time())
        if datetime.utcnow() > cutoff:
            from app.utils.exceptions import AppException
            raise AppException(400, "Attendance cannot be marked or modified after 24 hours of the class date.")

        transactions = []
        
        for record in request.records:
            # Check if record already exists for this slot/subject/date
            existing = db.scalar(
                select(AttendanceTransaction).where(
                    and_(
                        AttendanceTransaction.student_id == UUID(record.student_id),
                        AttendanceTransaction.subject_id == UUID(request.subject_id),
                        AttendanceTransaction.date == request.date,
                        AttendanceTransaction.slot_id == (UUID(request.slot_id) if request.slot_id else None)
                    )
                )
            )

            if existing:
                # Update existing record
                existing.status = record.status
                existing.remarks = record.remarks
                existing.class_type = request.class_type
                existing.marked_by = UUID(marked_by_id)
                transactions.append(existing)
            else:
                # Create new record
                new_txn = AttendanceTransaction(
                    student_id=UUID(record.student_id),
                    subject_id=UUID(request.subject_id),
                    date=request.date,
                    slot_id=UUID(request.slot_id) if request.slot_id else None,
                    status=record.status,
                    marked_by=UUID(marked_by_id),
                    class_type=request.class_type,
                    source_id=UUID(request.source_id) if request.source_id else None,
                    approval_status="approved", # Default to approved unless it's an activity
                    remarks=record.remarks
                )
                db.add(new_txn)
                transactions.append(new_txn)
        
        try:
            db.commit()
            for t in transactions:
                db.refresh(t)
        except IntegrityError as e:
            db.rollback()
            raise HTTPException(status_code=400, detail=f"Database integrity error: {str(e)}")
            
        return [AttendanceTransactionOut.model_validate(t) for t in transactions]

    @staticmethod
    def get_attendance_for_session(db: Session, subject_id: str, date: date, slot_id: Optional[str] = None) -> List[AttendanceTransactionOut]:
        query = select(AttendanceTransaction).where(
            and_(
                AttendanceTransaction.subject_id == UUID(subject_id),
                AttendanceTransaction.date == date,
            )
        )
        if slot_id:
            query = query.where(AttendanceTransaction.slot_id == UUID(slot_id))
        else:
            query = query.where(AttendanceTransaction.slot_id.is_(None))

        records = db.scalars(query).all()
        return [AttendanceTransactionOut.model_validate(r) for r in records]
