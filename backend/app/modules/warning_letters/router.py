import uuid
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query

from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, get_auth_context
from app.modules.warning_letters import service, schemas

warning_letter_router = APIRouter()


@warning_letter_router.get("", response_model=List[schemas.WarningLetterOut])
def get_warning_letters(
    status_filter: Optional[str] = Query(None, description="Filter by status (e.g., pending_approval, approved, dispatched)"),
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
):
    # Using primary_role, but also handle demo logic if needed
    user_role = auth.user.primary_role or "teacher"
    email = auth.user.email.lower()
    if "admin" in email:
        user_role = "admin"
    elif "dean" in email:
        user_role = "dean"
    elif "hod" in email:
        user_role = "hod"
        
    return service.get_warning_letters(
        db=db, 
        user_id=auth.user.id, 
        user_role=user_role, 
        status_filter=status_filter
    )


@warning_letter_router.get("/{letter_id}", response_model=schemas.WarningLetterOut)
def get_warning_letter(
    letter_id: uuid.UUID,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
):
    try:
        return service.get_warning_letter(db=db, letter_id=letter_id)
    except Exception as e:
        if hasattr(e, "status_code"):
            raise HTTPException(status_code=e.status_code, detail=e.message)
        raise HTTPException(status_code=404, detail="Warning letter not found")


@warning_letter_router.put("/{letter_id}/approve")
def approve_warning_letter(
    letter_id: uuid.UUID,
    request: schemas.WarningLetterApproveRequest,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
):
    # Only Dean/HOD should approve, but service doesn't enforce it strictly based on instructions.
    # Service updates hod_approved_by with user_id.
    try:
        return service.approve_warning_letter(
            db=db, 
            letter_id=letter_id, 
            user_id=auth.user.id, 
            approved=request.approved
        )
    except Exception as e:
        if hasattr(e, "status_code"):
            raise HTTPException(status_code=e.status_code, detail=e.message)
        raise HTTPException(status_code=400, detail=str(e))


@warning_letter_router.put("/{letter_id}/dispatch")
def dispatch_warning_letter(
    letter_id: uuid.UUID,
    request: schemas.WarningLetterDispatchRequest,
    db: Session = Depends(get_db),
    auth: AuthContext = Depends(get_auth_context),
):
    try:
        return service.dispatch_warning_letter(
            db=db, 
            letter_id=letter_id, 
            delivery_method=request.delivery_method
        )
    except Exception as e:
        if hasattr(e, "status_code"):
            raise HTTPException(status_code=e.status_code, detail=e.message)
        raise HTTPException(status_code=400, detail=str(e))
