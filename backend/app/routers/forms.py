from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.form import FormDefinition, FormResponse as FormResponseModel, FormStatus
from app.models.user import User
from app.schemas.form import FormCreate, FormResponse, FormSubmitRequest, FormSubmissionResponse, FormUpdate
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/forms", tags=["forms"])


@router.post("", response_model=FormResponse, status_code=status.HTTP_201_CREATED)
def create_form(
    payload: FormCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        form_status = FormStatus(payload.status)
    except ValueError:
        form_status = FormStatus.draft

    form = FormDefinition(
        organization_id=current_user.organization_id,
        created_by=current_user.id,
        title=payload.title,
        description=payload.description,
        status=form_status,
        target_course=payload.target_course,
        target_semester=payload.target_semester,
        deadline=payload.deadline,
        fields=[f.model_dump() for f in payload.fields] if payload.fields else [],
    )
    db.add(form)
    db.commit()
    db.refresh(form)
    return _to_response(form, current_user, 0)


@router.get("", response_model=list[FormResponse])
def list_forms(
    form_status: str | None = Query(default=None, alias="status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(FormDefinition).filter(FormDefinition.organization_id == current_user.organization_id, FormDefinition.is_deleted.is_(False))
    if form_status:
        query = query.filter(FormDefinition.status == form_status)

    forms = query.order_by(FormDefinition.created_at.desc()).all()
    result = []
    for form in forms:
        author = db.query(User).filter(User.id == form.created_by).first()
        response_count = db.query(FormResponseModel).filter(FormResponseModel.form_id == form.id).count()
        result.append(_to_response(form, author, response_count))
    return result


@router.get("/{form_id}", response_model=FormResponse)
def get_form(form_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id, FormDefinition.organization_id == current_user.organization_id, FormDefinition.is_deleted.is_(False)).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    author = db.query(User).filter(User.id == form.created_by).first()
    response_count = db.query(FormResponseModel).filter(FormResponseModel.form_id == form.id).count()
    return _to_response(form, author, response_count)


@router.put("/{form_id}", response_model=FormResponse)
def update_form(form_id: UUID, payload: FormUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id, FormDefinition.organization_id == current_user.organization_id, FormDefinition.created_by == current_user.id, FormDefinition.is_deleted.is_(False)).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found or not authorized")

    update_data = payload.model_dump(exclude_none=True)
    if "fields" in update_data:
        update_data["fields"] = [f.model_dump() if hasattr(f, "model_dump") else f for f in update_data["fields"]]
    if "status" in update_data:
        try:
            update_data["status"] = FormStatus(update_data["status"])
        except ValueError:
            del update_data["status"]

    for key, value in update_data.items():
        setattr(form, key, value)

    db.commit()
    db.refresh(form)
    response_count = db.query(FormResponseModel).filter(FormResponseModel.form_id == form.id).count()
    return _to_response(form, current_user, response_count)


@router.delete("/{form_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_form(form_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id, FormDefinition.organization_id == current_user.organization_id, FormDefinition.is_deleted.is_(False)).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    if form.created_by != current_user.id and current_user.role.value not in ("dean", "hod"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to delete this form")

    form.is_deleted = True
    form.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None


@router.post("/{form_id}/submit", response_model=FormSubmissionResponse, status_code=status.HTTP_201_CREATED)
def submit_form(form_id: UUID, payload: FormSubmitRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id, FormDefinition.organization_id == current_user.organization_id, FormDefinition.is_deleted.is_(False), FormDefinition.status == FormStatus.active).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found or not active")

    existing = db.query(FormResponseModel).filter(FormResponseModel.form_id == form_id, FormResponseModel.submitted_by == current_user.id).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="You have already submitted this form")

    response = FormResponseModel(organization_id=current_user.organization_id, form_id=form_id, submitted_by=current_user.id, answers=payload.answers)
    db.add(response)
    db.commit()
    db.refresh(response)
    return response


@router.get("/{form_id}/responses", response_model=list[FormSubmissionResponse])
def list_form_responses(form_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    form = db.query(FormDefinition).filter(FormDefinition.id == form_id, FormDefinition.organization_id == current_user.organization_id, FormDefinition.is_deleted.is_(False)).first()
    if not form:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Form not found")
    if form.created_by != current_user.id and current_user.role.value not in ("dean", "hod"):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view responses")

    return db.query(FormResponseModel).filter(FormResponseModel.form_id == form_id).order_by(FormResponseModel.created_at.desc()).all()


def _to_response(form: FormDefinition, author: User | None, response_count: int) -> dict:
    return {
        "id": form.id,
        "title": form.title,
        "description": form.description,
        "status": form.status.value,
        "target_course": form.target_course,
        "target_semester": form.target_semester,
        "deadline": form.deadline,
        "fields": form.fields,
        "created_by": form.created_by,
        "author_name": author.full_name if author else None,
        "response_count": response_count,
        "created_at": form.created_at,
    }
