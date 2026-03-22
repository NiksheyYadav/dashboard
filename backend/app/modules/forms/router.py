import logging
from datetime import datetime, timezone
from typing import Optional, Union

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.form import FormDefinition
from app.modules.auth.dependencies import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

forms_router = APIRouter(prefix="/forms", tags=["forms"])


class FormField(BaseModel):
    id: str
    type: str
    label: str
    required: bool
    options: Optional[list] = None
    scaleMin: Optional[int] = None
    scaleMax: Optional[int] = None


class FormCreate(BaseModel):
    title: str
    description: str
    fields: list[FormField]
    targetCourse: str
    targetSemester: Union[int, str, None] = "all"
    deadline: str
    isActive: bool = True


class FormOut(BaseModel):
    id: str
    title: str
    description: str
    fields: list[FormField]
    targetCourse: str
    targetSemester: Union[int, str]
    createdBy: str
    createdAt: str
    deadline: str
    isActive: bool

    class Config:
        from_attributes = True


def _to_out(form: FormDefinition) -> dict:
    semester: Union[str, int] = form.target_semester
    try:
        semester = int(form.target_semester)
    except (TypeError, ValueError):
        semester = form.target_semester or "all"

    return {
        "id": form.id,
        "title": form.title,
        "description": form.description,
        "fields": form.fields or [],
        "targetCourse": form.target_course,
        "targetSemester": semester,
        "createdBy": form.created_by,
        "createdAt": form.created_at.isoformat() if form.created_at else "",
        "deadline": form.deadline.isoformat() if form.deadline else "",
        "isActive": form.is_active,
    }


def _parse_deadline(deadline: str) -> datetime:
    try:
        parsed = datetime.fromisoformat(deadline)
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid deadline format")
    if parsed.tzinfo is None:
        parsed = parsed.replace(tzinfo=timezone.utc)
    return parsed


@forms_router.get("")
def list_forms(db: Session = Depends(get_db)):
    forms = db.query(FormDefinition).order_by(FormDefinition.created_at.desc()).all()
    return [_to_out(f) for f in forms]


@forms_router.post("", status_code=201)
def create_form(
    body: FormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    form = FormDefinition(
        title=body.title,
        description=body.description,
        fields=[field.model_dump() for field in body.fields],
        target_course=body.targetCourse or "all",
        target_semester=str(body.targetSemester) if body.targetSemester is not None else "all",
        created_by=current_user.email,
        created_at=datetime.now(timezone.utc),
        deadline=_parse_deadline(body.deadline),
        is_active=body.isActive,
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    logger.info("Created form %s", form.id)
    return _to_out(form)


@forms_router.get("/{form_id}")
def get_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    return _to_out(form)


@forms_router.put("/{form_id}/toggle")
def toggle_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    form.is_active = not form.is_active
    db.commit()
    db.refresh(form)
    logger.info("Toggled form %s to %s", form_id, form.is_active)
    return _to_out(form)


@forms_router.delete("/{form_id}")
def delete_form(form_id: str, db: Session = Depends(get_db)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id).first()
    if not form:
        raise HTTPException(status_code=404, detail="Form not found")
    db.delete(form)
    db.commit()
    logger.info("Deleted form %s", form_id)
    return {"detail": "Deleted"}
