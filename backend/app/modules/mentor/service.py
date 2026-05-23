import uuid
from typing import List
from uuid import UUID
from datetime import datetime
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.counselling_note import CounsellingNote
from app.models.parent_communication import ParentCommunication
from app.models.regularization_request import RegularizationRequest
from app.models.warning_letter import WarningLetter

from app.modules.mentor.schemas import (
    CounsellingNoteCreate, CounsellingNoteOut,
    ParentCommunicationCreate, ParentCommunicationOut,
    RegularizationRequestCreate, RegularizationRequestOut,
    WarningLetterGenerateRequest, WarningLetterOut
)

class MentorService:
    @staticmethod
    def create_counselling_note(db: Session, mentor_id: str, request: CounsellingNoteCreate) -> CounsellingNoteOut:
        note = CounsellingNote(
            mentor_id=UUID(mentor_id),
            student_id=UUID(request.student_id),
            note=request.note,
            corrective_action=request.corrective_action,
            student_response=request.student_response,
            improvement_plan=request.improvement_plan,
            next_review_date=request.next_review_date
        )
        db.add(note)
        db.commit()
        db.refresh(note)
        return CounsellingNoteOut.model_validate(note)

    @staticmethod
    def get_student_counselling_notes(db: Session, student_id: str) -> List[CounsellingNoteOut]:
        notes = db.scalars(
            select(CounsellingNote)
            .where(CounsellingNote.student_id == UUID(student_id))
            .order_by(CounsellingNote.created_at.desc())
        ).all()
        return [CounsellingNoteOut.model_validate(n) for n in notes]

    @staticmethod
    def log_parent_communication(db: Session, mentor_id: str, request: ParentCommunicationCreate) -> ParentCommunicationOut:
        comm = ParentCommunication(
            mentor_id=UUID(mentor_id),
            student_id=UUID(request.student_id),
            communication_type=request.communication_type,
            summary=request.summary,
            follow_up_date=request.follow_up_date
        )
        db.add(comm)
        db.commit()
        db.refresh(comm)
        return ParentCommunicationOut.model_validate(comm)

    @staticmethod
    def get_student_parent_communications(db: Session, student_id: str) -> List[ParentCommunicationOut]:
        comms = db.scalars(
            select(ParentCommunication)
            .where(ParentCommunication.student_id == UUID(student_id))
            .order_by(ParentCommunication.created_at.desc())
        ).all()
        return [ParentCommunicationOut.model_validate(c) for c in comms]

    @staticmethod
    def submit_regularization_request(db: Session, mentor_id: str, request: RegularizationRequestCreate) -> RegularizationRequestOut:
        req = RegularizationRequest(
            mentor_id=UUID(mentor_id),
            student_id=UUID(request.student_id),
            reason_category=request.reason_category,
            date=request.date,
            slot_id=UUID(request.slot_id) if request.slot_id else None,
            subject_id=UUID(request.subject_id) if request.subject_id else None,
            proof_document=request.proof_document,
            remarks=request.remarks,
            status="submitted"
        )
        db.add(req)
        db.commit()
        db.refresh(req)
        return RegularizationRequestOut.model_validate(req)

    @staticmethod
    def generate_warning_letter(db: Session, mentor_id: str, request: WarningLetterGenerateRequest) -> WarningLetterOut:
        # Generate a unique letter number
        letter_num = f"WARN-{datetime.utcnow().strftime('%Y%m%d')}-{str(uuid.uuid4())[:8].upper()}"
        
        letter = WarningLetter(
            letter_number=letter_num,
            student_id=UUID(request.student_id),
            mentor_id=UUID(mentor_id),
            stage=request.stage,
            reason=request.reason,
            attendance_data=request.attendance_data,
            prior_interventions=request.prior_interventions,
            required_compliance=request.required_compliance
        )
        db.add(letter)
        db.commit()
        db.refresh(letter)
        return WarningLetterOut.model_validate(letter)
