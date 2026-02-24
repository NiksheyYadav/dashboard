from __future__ import annotations

from pathlib import Path
from uuid import UUID

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.cv import CVFile, CVStatus
from app.models.student import Student
from app.models.user import User
from app.schemas.cv import CVResponse, CVReviewRequest
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/cv", tags=["cv"])

UPLOAD_ROOT = Path("uploads/cv")
UPLOAD_ROOT.mkdir(parents=True, exist_ok=True)


@router.post("/upload/{student_id}", response_model=CVResponse, status_code=status.HTTP_201_CREATED)
def upload_cv(
    student_id: UUID,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod", "coordinator", "faculty"})),
):
    student = db.query(Student).filter(Student.id == student_id, Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    safe_name = f"{student_id}_{file.filename}"
    target_path = UPLOAD_ROOT / safe_name
    target_path.write_bytes(file.file.read())

    cv = CVFile(
        organization_id=current_user.organization_id,
        student_id=student_id,
        uploaded_by=current_user.id,
        file_name=file.filename or safe_name,
        file_path=str(target_path),
        status=CVStatus.pending,
    )
    db.add(cv)
    db.commit()
    db.refresh(cv)
    return cv


@router.get("/student/{student_id}", response_model=list[CVResponse])
def list_student_cvs(student_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return db.query(CVFile).filter(CVFile.student_id == student_id, CVFile.organization_id == current_user.organization_id).order_by(CVFile.created_at.desc()).all()


@router.patch("/{cv_id}/approve", response_model=CVResponse)
def approve_cv(
    cv_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod"})),
):
    cv = db.query(CVFile).filter(CVFile.id == cv_id, CVFile.organization_id == current_user.organization_id).first()
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")

    cv.status = CVStatus.uploaded
    cv.reviewed_by = current_user.id
    cv.rejection_reason = None
    db.commit()
    db.refresh(cv)
    return cv


@router.patch("/{cv_id}/reject", response_model=CVResponse)
def reject_cv(
    cv_id: UUID,
    payload: CVReviewRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod"})),
):
    cv = db.query(CVFile).filter(CVFile.id == cv_id, CVFile.organization_id == current_user.organization_id).first()
    if not cv:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="CV not found")

    cv.status = CVStatus.rejected
    cv.reviewed_by = current_user.id
    cv.rejection_reason = payload.reason
    db.commit()
    db.refresh(cv)
    return cv
