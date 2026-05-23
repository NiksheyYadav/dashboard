from fastapi import APIRouter, Depends, Response
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.reports.schemas import ReportRequest
from app.modules.reports.service import ReportService

reports_router = APIRouter(prefix="/reports", tags=["reports"])

@reports_router.post("/export")
def export_report(
    req: ReportRequest,
    auth: AuthContext = Depends(RequireRole(["hod", "dean", "admin"])),
    db: Session = Depends(get_db)
):
    csv_bytes = ReportService.generate_report(db, req)
    
    # Return as downloadable CSV
    return Response(
        content=csv_bytes,
        media_type="text/csv",
        headers={
            "Content-Disposition": f"attachment; filename={req.report_type.value}_export.csv"
        }
    )
