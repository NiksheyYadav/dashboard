from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.notifications.service import NotificationService

notifications_router = APIRouter(prefix="/notifications", tags=["notifications"])


@notifications_router.get("")
def get_notifications(
    unread_only: bool = False,
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor", "activity_coordinator"])),
    db: Session = Depends(get_db),
):
    return NotificationService.get_user_notifications(db, str(auth.user.id), unread_only)


@notifications_router.get("/count")
def get_unread_count(
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor", "activity_coordinator"])),
    db: Session = Depends(get_db),
):
    return {"unread_count": NotificationService.get_unread_count(db, str(auth.user.id))}


@notifications_router.put("/read")
def mark_all_read(
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor", "activity_coordinator"])),
    db: Session = Depends(get_db),
):
    return NotificationService.mark_as_read(db, str(auth.user.id))


@notifications_router.put("/read/{notification_id}")
def mark_one_read(
    notification_id: str,
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod", "teacher", "mentor", "activity_coordinator"])),
    db: Session = Depends(get_db),
):
    return NotificationService.mark_as_read(db, str(auth.user.id), notification_id)
