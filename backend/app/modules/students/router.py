from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select, func
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.student import Student
from app.modules.auth.dependencies import AuthContext, get_auth_context
from app.modules.students.schemas import (
    PaginatedStudentsResponse,
    StudentCreate,
    StudentResponse,
    StudentUpdate,
)

students_router = APIRouter(prefix="/students", tags=["students"])


def _to_response(s: Student) -> StudentResponse:
    return StudentResponse(
        id=str(s.id),
        name=s.name,
        rollNo=s.roll_no,
        course=s.course,
        department=s.department,
        cvStatus=s.cv_status,
        attendancePercent=s.attendance_percent,
        semester=s.semester,
        email=s.email,
        phone=s.phone,
        status=s.status,
    )


@students_router.get("", response_model=PaginatedStudentsResponse)
def list_students(
    page: int = Query(default=1, ge=1),
    limit: int = Query(default=10, ge=1, le=100),
    course: str = Query(default="all"),
    semester: int = Query(default=0),
    search: str = Query(default=""),
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> PaginatedStudentsResponse:
    query = select(Student)

    if course != "all":
        query = query.where(Student.course.ilike(f"%{course.replace('-', ' ')}%"))
    if semester > 0:
        query = query.where(Student.semester == semester)
    if search:
        query = query.where(
            Student.name.ilike(f"%{search}%") | Student.roll_no.ilike(f"%{search}%")
        )

    total = db.scalar(select(func.count()).select_from(query.subquery())) or 0
    students = db.scalars(
        query.order_by(Student.created_at.desc()).offset((page - 1) * limit).limit(limit)
    ).all()

    return PaginatedStudentsResponse(
        data=[_to_response(s) for s in students],
        total=total,
        page=page,
        limit=limit,
    )


@students_router.post("", response_model=StudentResponse, status_code=201)
def create_student(
    payload: StudentCreate,
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> StudentResponse:
    existing = db.scalar(select(Student).where(Student.roll_no == payload.rollNo))
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Roll number already exists")

    student = Student(
        name=payload.name,
        roll_no=payload.rollNo,
        course=payload.course,
        department=payload.course,
        semester=payload.semester,
        email=payload.email,
        phone=payload.phone,
    )
    db.add(student)
    db.commit()
    db.refresh(student)
    return _to_response(student)


@students_router.get("/{student_id}", response_model=StudentResponse)
def get_student(
    student_id: str,
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> StudentResponse:
    student = db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    return _to_response(student)


@students_router.patch("/{student_id}", response_model=StudentResponse)
def update_student(
    student_id: str,
    payload: StudentUpdate,
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> StudentResponse:
    student = db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")

    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(student, key, value)
    if "course" in update_data:
        student.department = update_data["course"]

    db.commit()
    db.refresh(student)
    return _to_response(student)


@students_router.delete("/{student_id}", status_code=204)
def delete_student(
    student_id: str,
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> None:
    student = db.scalar(select(Student).where(Student.id == student_id))
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    db.delete(student)
    db.commit()
