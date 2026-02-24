from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.fee import FeeRecord, FeeStatus, FeeType
from app.models.student import Student
from app.models.user import User
from app.schemas.fee import FeeCreate, FeeResponse, FeeSummaryResponse, FeeUpdate
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/fees", tags=["fees"])


@router.post("", response_model=FeeResponse, status_code=status.HTTP_201_CREATED)
def create_fee(payload: FeeCreate, db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    student = db.query(Student).filter(Student.id == payload.student_id, Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    try:
        fee_type = FeeType(payload.fee_type)
    except ValueError:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid fee type")

    fee = FeeRecord(organization_id=current_user.organization_id, student_id=payload.student_id, fee_type=fee_type, amount=payload.amount, paid_amount=0, status=FeeStatus.pending, semester=payload.semester, academic_year=payload.academic_year, due_date=payload.due_date, remarks=payload.remarks)
    db.add(fee)
    db.commit()
    db.refresh(fee)
    return _to_response(fee, student)


@router.get("", response_model=list[FeeResponse])
def list_fees(fee_status: str | None = Query(default=None, alias="status"), student_id: UUID | None = Query(default=None), db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    query = db.query(FeeRecord).join(Student, Student.id == FeeRecord.student_id).filter(FeeRecord.organization_id == current_user.organization_id, FeeRecord.is_deleted.is_(False))
    if fee_status:
        query = query.filter(FeeRecord.status == fee_status)
    if student_id:
        query = query.filter(FeeRecord.student_id == student_id)

    fees = query.order_by(FeeRecord.created_at.desc()).all()
    result = []
    for fee in fees:
        student = db.query(Student).filter(Student.id == fee.student_id).first()
        result.append(_to_response(fee, student))
    return result


@router.get("/summary", response_model=FeeSummaryResponse)
def fee_summary(db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    fees = db.query(FeeRecord).filter(FeeRecord.organization_id == current_user.organization_id, FeeRecord.is_deleted.is_(False)).all()
    total_amount = sum(float(f.amount) for f in fees)
    total_collected = sum(float(f.paid_amount) for f in fees)
    paid_count = sum(1 for f in fees if f.status == FeeStatus.paid)
    pending_count = sum(1 for f in fees if f.status == FeeStatus.pending)
    overdue_count = sum(1 for f in fees if f.status == FeeStatus.overdue)

    return {"total_records": len(fees), "total_amount": total_amount, "total_collected": total_collected, "total_pending": total_amount - total_collected, "paid_count": paid_count, "pending_count": pending_count, "overdue_count": overdue_count}


@router.patch("/{fee_id}", response_model=FeeResponse)
def update_fee(fee_id: UUID, payload: FeeUpdate, db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean", "hod"}))):
    fee = db.query(FeeRecord).filter(FeeRecord.id == fee_id, FeeRecord.organization_id == current_user.organization_id, FeeRecord.is_deleted.is_(False)).first()
    if not fee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee record not found")

    update_data = payload.model_dump(exclude_none=True)
    if "status" in update_data:
        try:
            update_data["status"] = FeeStatus(update_data["status"])
        except ValueError:
            del update_data["status"]

    for key, value in update_data.items():
        setattr(fee, key, value)

    db.commit()
    db.refresh(fee)
    student = db.query(Student).filter(Student.id == fee.student_id).first()
    return _to_response(fee, student)


@router.delete("/{fee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_fee(fee_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(require_roles({"dean"}))):
    fee = db.query(FeeRecord).filter(FeeRecord.id == fee_id, FeeRecord.organization_id == current_user.organization_id, FeeRecord.is_deleted.is_(False)).first()
    if not fee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Fee record not found")

    fee.is_deleted = True
    fee.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None


def _to_response(fee: FeeRecord, student: Student | None) -> dict:
    student_name = f"{student.first_name} {student.last_name}" if student else "Unknown"
    return {"id": fee.id, "student_id": fee.student_id, "student_name": student_name, "fee_type": fee.fee_type.value, "amount": fee.amount, "paid_amount": fee.paid_amount, "status": fee.status.value, "semester": fee.semester, "academic_year": fee.academic_year, "due_date": fee.due_date, "remarks": fee.remarks, "created_at": fee.created_at}
