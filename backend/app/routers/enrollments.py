from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.enrollment import Enrollment
from app.models.user import User
from app.schemas.enrollment import EnrollmentCreate, EnrollmentResponse
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/enrollments", tags=["enrollments"])


@router.post("", response_model=EnrollmentResponse, status_code=status.HTTP_201_CREATED)
def create_enrollment(
    payload: EnrollmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod", "coordinator", "faculty"})),
):
    exists = db.query(Enrollment).filter(Enrollment.student_id == payload.student_id, Enrollment.course_id == payload.course_id, Enrollment.organization_id == current_user.organization_id).first()
    if exists:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Student already enrolled")

    enrollment = Enrollment(organization_id=current_user.organization_id, **payload.model_dump())
    db.add(enrollment)
    db.commit()
    db.refresh(enrollment)
    return enrollment


@router.get("/by-student/{student_id}", response_model=list[EnrollmentResponse])
def list_enrollments_by_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return (
        db.query(Enrollment)
        .filter(Enrollment.student_id == student_id, Enrollment.organization_id == current_user.organization_id)
        .order_by(Enrollment.created_at.desc())
        .all()
    )
