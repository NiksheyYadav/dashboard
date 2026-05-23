import uuid
from uuid import UUID
from datetime import datetime, time
from typing import List
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.models.leave_request import LeaveRequest
from app.models.arrangement_assignment import ArrangementAssignment
from app.models.extra_class import ExtraClass
from app.modules.leaves.schemas import (
    LeaveRequestCreate, LeaveRequestOut,
    ArrangementResponse, HodLeaveApproval,
    ExtraClassCreate, ExtraClassOut
)
from app.utils.exceptions import AppException

class LeaveService:
    @staticmethod
    def create_leave_request(db: Session, teacher_id: str, request: LeaveRequestCreate) -> LeaveRequestOut:
        leave = LeaveRequest(
            teacher_id=UUID(teacher_id),
            leave_type=request.leave_type,
            from_date=request.from_date,
            to_date=request.to_date,
            reason=request.reason,
            status="arrangement_pending" if request.arrangements else "hod_pending"
        )
        db.add(leave)
        db.flush() # Get leave.id

        for arr in request.arrangements:
            assignment = ArrangementAssignment(
                leave_request_id=leave.id,
                slot_id=UUID(arr.slot_id),
                original_teacher_id=UUID(teacher_id),
                arrangement_teacher_id=UUID(arr.arrangement_teacher_id),
                subject_id=UUID(arr.subject_id),
                section_id=UUID(arr.section_id),
                date=arr.date,
                status="pending"
            )
            db.add(assignment)

        db.commit()
        # To get the nested arrangements populated in the object, we can re-fetch or rely on relationships
        # if relationships are set up. Since we just need to return the ID typically:
        db.refresh(leave)
        return LeaveRequestOut.model_validate(leave)

    @staticmethod
    def get_my_leaves(db: Session, teacher_id: str) -> List[LeaveRequestOut]:
        leaves = db.scalars(
            select(LeaveRequest)
            .where(LeaveRequest.teacher_id == UUID(teacher_id))
            .order_by(LeaveRequest.created_at.desc())
        ).all()
        return [LeaveRequestOut.model_validate(l) for l in leaves]

    @staticmethod
    def respond_to_arrangement(db: Session, arrangement_teacher_id: str, arrangement_id: str, response: ArrangementResponse) -> dict:
        arr = db.get(ArrangementAssignment, UUID(arrangement_id))
        if not arr:
            raise AppException(404, "Arrangement not found")
        if str(arr.arrangement_teacher_id) != arrangement_teacher_id:
            raise AppException(403, "Not authorized to respond to this arrangement")

        arr.status = response.status
        arr.response_remarks = response.response_remarks
        arr.responded_at = datetime.utcnow()
        db.commit()

        # Check if all arrangements for the leave are accepted, then move leave to hod_pending
        leave = db.get(LeaveRequest, arr.leave_request_id)
        if leave:
            pending_count = db.query(ArrangementAssignment).filter(
                ArrangementAssignment.leave_request_id == leave.id,
                ArrangementAssignment.status == "pending"
            ).count()
            if pending_count == 0:
                leave.status = "hod_pending"
                db.commit()

        return {"status": "success", "arrangement_status": arr.status}

    @staticmethod
    def process_hod_approval(db: Session, hod_id: str, leave_id: str, approval: HodLeaveApproval) -> dict:
        leave = db.get(LeaveRequest, UUID(leave_id))
        if not leave:
            raise AppException(404, "Leave not found")
        
        leave.status = approval.status
        leave.hod_remarks = approval.hod_remarks
        leave.hod_approved_by = UUID(hod_id)
        leave.hod_approved_at = datetime.utcnow()
        db.commit()
        return {"status": "success", "leave_status": leave.status}

    @staticmethod
    def schedule_extra_class(db: Session, teacher_id: str, request: ExtraClassCreate) -> ExtraClassOut:
        # Parse time string HH:MM:SS to time object
        try:
            st = datetime.strptime(request.start_time, "%H:%M:%S").time()
            et = datetime.strptime(request.end_time, "%H:%M:%S").time()
        except ValueError:
            raise AppException(400, "Invalid time format. Use HH:MM:SS")

        extra = ExtraClass(
            teacher_id=UUID(teacher_id),
            subject_id=UUID(request.subject_id),
            section_id=UUID(request.section_id),
            date=request.date,
            start_time=st,
            end_time=et,
            class_type=request.class_type,
            reason=request.reason,
            topic_covered=request.topic_covered,
            room=request.room,
            attendance_status="scheduled",
            is_conducted=False
        )
        db.add(extra)
        db.commit()
        db.refresh(extra)

        # Convert Time to string for Pydantic
        resp = ExtraClassOut.model_validate(extra)
        resp.start_time = extra.start_time.strftime("%H:%M:%S")
        resp.end_time = extra.end_time.strftime("%H:%M:%S")
        return resp
