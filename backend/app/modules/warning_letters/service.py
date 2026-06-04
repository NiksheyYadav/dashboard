import uuid
from datetime import datetime
from typing import List, Optional

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.student import Student
from app.models.user import User
from app.models.warning_letter import WarningLetter
from app.modules.warning_letters.schemas import WarningLetterOut
from app.utils.exceptions import AppException


def get_warning_letters(
    db: Session, user_id: uuid.UUID, user_role: str, status_filter: Optional[str] = None
) -> List[WarningLetterOut]:
    query = (
        select(
            WarningLetter,
            Student.name.label("student_name"),
            Student.roll_no.label("student_roll_no"),
            User.name.label("mentor_name"),
        )
        .join(Student, WarningLetter.student_id == Student.id)
        .join(User, WarningLetter.mentor_id == User.id)
    )

    if user_role.lower() in ["teacher", "mentor"]:
        query = query.where(WarningLetter.mentor_id == user_id)

    if status_filter == "pending_approval":
        query = query.where(WarningLetter.hod_approved_by.is_(None))
    elif status_filter == "approved":
        query = query.where(WarningLetter.hod_approved_by.is_not(None))
    elif status_filter == "dispatched":
        query = query.where(WarningLetter.parent_copy_sent == True)

    results = db.execute(query).all()

    out_list = []
    for wl, s_name, s_roll, m_name in results:
        data = {c.name: getattr(wl, c.name) for c in wl.__table__.columns}
        data["student_name"] = s_name
        data["student_roll_no"] = s_roll
        data["mentor_name"] = m_name or "Unknown Mentor"
        out_list.append(WarningLetterOut(**data))

    return out_list


def get_warning_letter(db: Session, letter_id: uuid.UUID) -> WarningLetterOut:
    query = (
        select(
            WarningLetter,
            Student.name.label("student_name"),
            Student.roll_no.label("student_roll_no"),
            User.name.label("mentor_name"),
        )
        .join(Student, WarningLetter.student_id == Student.id)
        .join(User, WarningLetter.mentor_id == User.id)
        .where(WarningLetter.id == letter_id)
    )

    result = db.execute(query).first()
    if not result:
        raise AppException(status_code=404, message="Warning letter not found")

    wl, s_name, s_roll, m_name = result
    data = {c.name: getattr(wl, c.name) for c in wl.__table__.columns}
    data["student_name"] = s_name
    data["student_roll_no"] = s_roll
    data["mentor_name"] = m_name or "Unknown Mentor"
    return WarningLetterOut(**data)


def approve_warning_letter(
    db: Session, letter_id: uuid.UUID, user_id: uuid.UUID, approved: bool
) -> dict:
    wl = db.scalar(select(WarningLetter).where(WarningLetter.id == letter_id))
    if not wl:
        raise AppException(status_code=404, message="Warning letter not found")

    if approved:
        wl.hod_approved_by = user_id
        wl.hod_approved_at = datetime.utcnow()
    else:
        # If not approved, maybe clear it?
        wl.hod_approved_by = None
        wl.hod_approved_at = None

    db.commit()
    return {"message": "Warning letter approval status updated"}


def dispatch_warning_letter(db: Session, letter_id: uuid.UUID, delivery_method: str) -> dict:
    wl = db.scalar(select(WarningLetter).where(WarningLetter.id == letter_id))
    if not wl:
        raise AppException(status_code=404, message="Warning letter not found")

    wl.parent_copy_sent = True
    wl.issue_date = datetime.utcnow().date()
    wl.delivery_method = delivery_method

    db.commit()
    return {"message": "Warning letter dispatched successfully"}
