from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.student import Student
from app.models.user import User
from app.schemas.student import StudentCreate, StudentResponse, StudentUpdate
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/students", tags=["students"])


@router.post("", response_model=StudentResponse, status_code=status.HTTP_201_CREATED)
def create_student(
    payload: StudentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod", "coordinator", "faculty"})),
):
    student = Student(organization_id=current_user.organization_id, **payload.model_dump())
    db.add(student)
    db.commit()
    db.refresh(student)
    return student


@router.get("", response_model=list[StudentResponse])
def list_students(
    department: UUID | None = Query(default=None),
    semester: UUID | None = Query(default=None),
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Student).filter(Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False))

    if department:
        query = query.filter(Student.department_id == department)
    if semester:
        query = query.filter(Student.semester_id == semester)
    if search:
        pattern = f"%{search}%"
        query = query.filter(or_(Student.first_name.ilike(pattern), Student.last_name.ilike(pattern), Student.roll_number.ilike(pattern)))

    return query.order_by(Student.created_at.desc()).all()


@router.get("/{student_id}", response_model=StudentResponse)
def get_student(student_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    student = db.query(Student).filter(Student.id == student_id, Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")
    return student


@router.put("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: UUID,
    payload: StudentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod", "coordinator", "faculty"})),
):
    student = db.query(Student).filter(Student.id == student_id, Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        setattr(student, key, value)

    db.commit()
    db.refresh(student)
    return student


@router.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_student(
    student_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod"})),
):
    student = db.query(Student).filter(Student.id == student_id, Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).first()
    if not student:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Student not found")

    student.is_deleted = True
    student.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None
