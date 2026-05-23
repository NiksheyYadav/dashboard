from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.activity.schemas import (
    ActivityCreate,
    ActivityOut,
    ParticipantBulkAdd,
    ParticipantOut,
    CreditAttendanceRequest,
    ActivityApprovalRequest,
)
from app.modules.activity.service import ActivityService

activity_router = APIRouter(prefix="/activities", tags=["activities"])


@activity_router.post("", response_model=ActivityOut)
def create_activity(
    data: ActivityCreate,
    auth: AuthContext = Depends(
        RequireRole(["activity_coordinator", "teacher", "hod", "dean", "admin"])
    ),
    db: Session = Depends(get_db),
):
    return ActivityService.create_activity(db, str(auth.user.id), data)


@activity_router.get("", response_model=List[ActivityOut])
def list_activities(
    mine_only: bool = False,
    auth: AuthContext = Depends(
        RequireRole(["activity_coordinator", "teacher", "hod", "dean", "admin"])
    ),
    db: Session = Depends(get_db),
):
    user_id = str(auth.user.id) if mine_only else None
    return ActivityService.list_activities(db, user_id)


@activity_router.post("/{activity_id}/participants", response_model=List[ParticipantOut])
def add_participants(
    activity_id: str,
    data: ParticipantBulkAdd,
    auth: AuthContext = Depends(
        RequireRole(["activity_coordinator", "teacher", "hod", "dean", "admin"])
    ),
    db: Session = Depends(get_db),
):
    return ActivityService.add_participants(db, activity_id, data)


@activity_router.get("/{activity_id}/participants", response_model=List[ParticipantOut])
def get_participants(
    activity_id: str,
    auth: AuthContext = Depends(
        RequireRole(["activity_coordinator", "teacher", "hod", "dean", "admin"])
    ),
    db: Session = Depends(get_db),
):
    return ActivityService.get_participants(db, activity_id)


@activity_router.put("/{activity_id}/credit")
def credit_attendance(
    activity_id: str,
    auth: AuthContext = Depends(
        RequireRole(["activity_coordinator", "hod", "dean", "admin"])
    ),
    db: Session = Depends(get_db),
):
    try:
        return ActivityService.credit_attendance(db, activity_id, str(auth.user.id))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@activity_router.put("/{activity_id}/approve", response_model=ActivityOut)
def approve_activity(
    activity_id: str,
    data: ActivityApprovalRequest,
    auth: AuthContext = Depends(RequireRole(["hod", "dean", "admin"])),
    db: Session = Depends(get_db),
):
    try:
        return ActivityService.approve_activity(
            db, activity_id, str(auth.user.id), data
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
