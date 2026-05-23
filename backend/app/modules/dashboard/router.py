from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.dashboard.schemas import DashboardMetricsOut, NotificationOut, ActionItemOut
from app.modules.dashboard.service import DashboardService

dashboard_router = APIRouter(prefix="/dashboard", tags=["dashboard"])

@dashboard_router.get("/metrics", response_model=DashboardMetricsOut)
def get_dashboard_metrics(
    auth: AuthContext = Depends(RequireRole(["hod", "dean", "admin"])),
    db: Session = Depends(get_db)
):
    return DashboardService.get_hod_metrics(db, str(auth.user.id))

@dashboard_router.get("/notifications", response_model=List[NotificationOut])
def get_notifications(
    auth: AuthContext = Depends(RequireRole(["teacher", "mentor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db)
):
    return DashboardService.get_notifications(db, str(auth.user.id))

@dashboard_router.get("/action-items", response_model=List[ActionItemOut])
def get_action_items(
    auth: AuthContext = Depends(RequireRole(["teacher", "mentor", "hod", "dean", "admin"])),
    db: Session = Depends(get_db)
):
    return DashboardService.get_action_items(db, str(auth.user.id))
