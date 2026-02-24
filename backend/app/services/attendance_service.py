from __future__ import annotations

import csv
import io
from datetime import date, datetime
from uuid import UUID

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.models.attendance import AttendanceRecord, AttendanceSession, AttendanceStatus, AttendanceUpload
from app.models.course import Course
from app.models.student import Student
from app.models.user import User

REQUIRED_HEADERS = ["student_id", "date", "course_code", "status"]


def _normalize_status(value: str) -> AttendanceStatus:
    try:
        return AttendanceStatus(value.strip().lower())
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Invalid attendance status: {value}") from exc


def process_attendance_csv(db: Session, file: UploadFile, current_user: User):
    raw = file.file.read().decode("utf-8")
    reader = csv.DictReader(io.StringIO(raw))

    if not reader.fieldnames or [h.strip() for h in reader.fieldnames] != REQUIRED_HEADERS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"CSV headers must be exactly: {','.join(REQUIRED_HEADERS)}",
        )

    processed_rows = 0
    created_records = 0
    skipped_records = 0
    errors: list[str] = []

    for index, row in enumerate(reader, start=2):
        processed_rows += 1
        try:
            student_id = UUID(row["student_id"])
            session_date = datetime.strptime(row["date"], "%Y-%m-%d").date()
            course_code = row["course_code"].strip()
            status_value = _normalize_status(row["status"])

            student = db.query(Student).filter(Student.id == student_id, Student.organization_id == current_user.organization_id, Student.is_deleted.is_(False)).first()
            if not student:
                raise ValueError("Student not found in organization")

            course = db.query(Course).filter(Course.code == course_code, Course.organization_id == current_user.organization_id, Course.is_deleted.is_(False)).first()
            if not course:
                raise ValueError(f"Course code not found: {course_code}")

            session = db.query(AttendanceSession).filter(AttendanceSession.organization_id == current_user.organization_id, AttendanceSession.course_id == course.id, AttendanceSession.session_date == session_date).first()
            if not session:
                session = AttendanceSession(organization_id=current_user.organization_id, course_id=course.id, session_date=session_date, created_by=current_user.id)
                db.add(session)
                db.flush()

            existing = db.query(AttendanceRecord).filter(AttendanceRecord.session_id == session.id, AttendanceRecord.student_id == student.id).first()
            if existing:
                skipped_records += 1
                continue

            db.add(AttendanceRecord(organization_id=current_user.organization_id, session_id=session.id, student_id=student.id, status=status_value))
            created_records += 1
        except Exception as exc:
            skipped_records += 1
            errors.append(f"Line {index}: {exc}")

    upload = AttendanceUpload(organization_id=current_user.organization_id, uploaded_by=current_user.id, file_name=file.filename or "attendance.csv", processed_rows=processed_rows, created_records=created_records, skipped_records=skipped_records, errors=errors)
    db.add(upload)
    db.commit()
    db.refresh(upload)

    return {"upload_id": upload.id, "processed_rows": processed_rows, "created_records": created_records, "skipped_records": skipped_records, "errors": errors}


def attendance_percentage(present: int, total: int) -> float:
    if total == 0:
        return 0.0
    return round((present / total) * 100, 2)


def start_of_week(value: date) -> date:
    return value.fromordinal(value.toordinal() - value.weekday())
