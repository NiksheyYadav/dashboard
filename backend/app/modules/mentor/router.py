from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.mentor.schemas import (
    CounsellingNoteCreate, CounsellingNoteOut,
    ParentCommunicationCreate, ParentCommunicationOut,
    RegularizationRequestCreate, RegularizationRequestOut,
    WarningLetterGenerateRequest, WarningLetterOut
)
from app.modules.mentor.service import MentorService

mentor_router = APIRouter(prefix="/mentor", tags=["mentor"])


@mentor_router.get("/mentees")
def get_my_mentees(
    auth: AuthContext = Depends(RequireRole(["mentor", "teacher", "hod", "dean"])),
    db: Session = Depends(get_db)
):
    return MentorService.get_mentees(db, str(auth.user.id))

@mentor_router.get("/compliance")
def get_my_compliance(
    auth: AuthContext = Depends(RequireRole(["mentor", "teacher", "hod", "dean"])),
    db: Session = Depends(get_db)
):
    return MentorService.get_mentor_compliance(db, str(auth.user.id))


@mentor_router.post("/counselling", response_model=CounsellingNoteOut)
def create_counselling_note(
    request: CounsellingNoteCreate,
    auth: AuthContext = Depends(RequireRole(["mentor", "hod", "dean"])),
    db: Session = Depends(get_db)
):
    return MentorService.create_counselling_note(db, str(auth.user.id), request)

@mentor_router.get("/counselling/student/{student_id}", response_model=List[CounsellingNoteOut])
def get_student_counselling_notes(
    student_id: str,
    _: AuthContext = Depends(RequireRole(["mentor", "hod", "dean", "teacher"])),
    db: Session = Depends(get_db)
):
    return MentorService.get_student_counselling_notes(db, student_id)

@mentor_router.post("/parent-communication", response_model=ParentCommunicationOut)
def log_parent_communication(
    request: ParentCommunicationCreate,
    auth: AuthContext = Depends(RequireRole(["mentor", "hod", "dean"])),
    db: Session = Depends(get_db)
):
    return MentorService.log_parent_communication(db, str(auth.user.id), request)

@mentor_router.get("/parent-communication/student/{student_id}", response_model=List[ParentCommunicationOut])
def get_student_parent_communications(
    student_id: str,
    _: AuthContext = Depends(RequireRole(["mentor", "hod", "dean"])),
    db: Session = Depends(get_db)
):
    return MentorService.get_student_parent_communications(db, student_id)

@mentor_router.post("/regularization", response_model=RegularizationRequestOut)
def submit_regularization(
    request: RegularizationRequestCreate,
    auth: AuthContext = Depends(RequireRole(["mentor"])),
    db: Session = Depends(get_db)
):
    return MentorService.submit_regularization_request(db, str(auth.user.id), request)

@mentor_router.post("/warning-letter", response_model=WarningLetterOut)
def generate_warning_letter(
    request: WarningLetterGenerateRequest,
    auth: AuthContext = Depends(RequireRole(["mentor", "hod", "dean"])),
    db: Session = Depends(get_db)
):
    return MentorService.generate_warning_letter(db, str(auth.user.id), request)
