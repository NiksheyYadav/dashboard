from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.leaves.schemas import (
    LeaveRequestCreate, LeaveRequestOut,
    ArrangementResponse, HodLeaveApproval,
    ExtraClassCreate, ExtraClassOut
)
from app.modules.leaves.service import LeaveService

leaves_router = APIRouter(prefix="/leaves", tags=["leaves", "arrangements"])

@leaves_router.post("/request", response_model=LeaveRequestOut)
def request_leave(
    request: LeaveRequestCreate,
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean", "mentor"])),
    db: Session = Depends(get_db)
):
    return LeaveService.create_leave_request(db, str(auth.user.id), request)

@leaves_router.get("/my-requests", response_model=List[LeaveRequestOut])
def get_my_leaves(
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean", "mentor"])),
    db: Session = Depends(get_db)
):
    return LeaveService.get_my_leaves(db, str(auth.user.id))

@leaves_router.post("/arrangements/{arrangement_id}/respond")
def respond_arrangement(
    arrangement_id: str,
    response: ArrangementResponse,
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean", "mentor"])),
    db: Session = Depends(get_db)
):
    return LeaveService.respond_to_arrangement(db, str(auth.user.id), arrangement_id, response)

@leaves_router.put("/arrangements/{arrangement_id}/hod-approve")
def hod_approve_arrangement(
    arrangement_id: str,
    approval: HodLeaveApproval,
    auth: AuthContext = Depends(RequireRole(["hod", "dean"])),
    db: Session = Depends(get_db),
):
    return LeaveService.hod_approve_arrangement(db, str(auth.user.id), arrangement_id, approval)

@leaves_router.post("/request/{leave_id}/hod-approval")
def hod_approval(
    leave_id: str,
    approval: HodLeaveApproval,
    auth: AuthContext = Depends(RequireRole(["hod", "dean"])),
    db: Session = Depends(get_db)
):
    return LeaveService.process_hod_approval(db, str(auth.user.id), leave_id, approval)

@leaves_router.post("/extra-class", response_model=ExtraClassOut)
def schedule_extra_class(
    request: ExtraClassCreate,
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean"])),
    db: Session = Depends(get_db),
):
    return LeaveService.schedule_extra_class(db, str(auth.user.id), request)


@leaves_router.get("/extra-classes", response_model=List[ExtraClassOut])
def list_extra_classes(
    mine_only: bool = False,
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    teacher_id = str(auth.user.id) if mine_only else None
    return LeaveService.get_extra_classes(db, teacher_id)


@leaves_router.get("/arrangements/pending")
def get_pending_arrangements(
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    return LeaveService.get_pending_arrangements(db, str(auth.user.id))
