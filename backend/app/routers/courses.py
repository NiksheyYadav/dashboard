from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.course import Course
from app.models.user import User
from app.schemas.course import CourseCreate, CourseResponse
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/courses", tags=["courses"])


@router.post("", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    payload: CourseCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod", "coordinator", "faculty"})),
):
    course = Course(organization_id=current_user.organization_id, **payload.model_dump())
    db.add(course)
    db.commit()
    db.refresh(course)
    return course


@router.get("", response_model=list[CourseResponse])
def list_courses(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    return (
        db.query(Course)
        .filter(Course.organization_id == current_user.organization_id, Course.is_deleted.is_(False))
        .order_by(Course.created_at.desc())
        .all()
    )
