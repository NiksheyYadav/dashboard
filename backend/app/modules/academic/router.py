from typing import List
from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from sqlalchemy import select

from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, get_auth_context, RequireRole
from app.modules.academic.schemas import (
    ProgrammeOut, SemesterOut, SectionOut, SubjectOut, TimetableSlotOut,
    ImportPreviewOut, ImportHistoryOut
)
from app.modules.academic.service import AcademicService
from app.models.programme import Programme
from app.models.semester import Semester
from app.models.section import Section
from app.models.subject import Subject
from app.models.timetable_slot import TimetableSlot

academic_router = APIRouter(prefix="/academic", tags=["academic"])

# --- Templates ---

@academic_router.get("/templates/{template_type}")
def download_template(
    template_type: str,
    _: AuthContext = Depends(RequireRole(["admin", "dean", "hod"]))
):
    valid_types = ["timetable", "faculty", "subjects", "students", "mentors"]
    if template_type not in valid_types:
        raise HTTPException(status_code=400, detail="Invalid template type")
    
    excel_io = AcademicService.get_template(template_type)
    return StreamingResponse(
        excel_io,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f"attachment; filename={template_type}_template.xlsx"}
    )

# --- Imports ---

@academic_router.post("/import/preview", response_model=ImportPreviewOut)
async def import_preview(
    import_type: str = Form(...),
    file: UploadFile = File(...),
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod"])),
    db: Session = Depends(get_db)
):
    return await AcademicService.process_import(db, file, import_type, str(auth.user.id))

@academic_router.post("/import/commit")
def import_commit(
    import_id: str = Form(...),
    auth: AuthContext = Depends(RequireRole(["admin", "dean", "hod"])),
    db: Session = Depends(get_db)
):
    AcademicService.commit_import(db, import_id, str(auth.user.id))
    return {"status": "success", "message": "Import committed successfully"}

@academic_router.get("/import/history", response_model=List[ImportHistoryOut])
def import_history(
    _: AuthContext = Depends(RequireRole(["admin", "dean", "hod"])),
    db: Session = Depends(get_db)
):
    return AcademicService.get_import_history(db)

@academic_router.post("/import/rollback/{import_id}")
def rollback_import(
    import_id: str,
    auth: AuthContext = Depends(RequireRole(["admin", "dean"])),
    db: Session = Depends(get_db)
):
    AcademicService.rollback_import(db, import_id, str(auth.user.id))
    return {"status": "success", "message": "Import rolled back successfully"}

# --- Basic Resource Listing ---

@academic_router.get("/programmes", response_model=List[ProgrammeOut])
def list_programmes(db: Session = Depends(get_db)):
    items = db.scalars(select(Programme)).all()
    return items

@academic_router.get("/semesters", response_model=List[SemesterOut])
def list_semesters(db: Session = Depends(get_db)):
    items = db.scalars(select(Semester)).all()
    return items

@academic_router.get("/sections", response_model=List[SectionOut])
def list_sections(db: Session = Depends(get_db)):
    items = db.scalars(select(Section)).all()
    return items

@academic_router.get("/subjects", response_model=List[SubjectOut])
def list_subjects(
    teacher_id: str = None,
    db: Session = Depends(get_db)
):
    stmt = select(Subject)
    if teacher_id:
        from uuid import UUID
        stmt = stmt.where(Subject.assigned_teacher_id == UUID(teacher_id))
    items = db.scalars(stmt).all()
    return items

@academic_router.get("/my-subjects", response_model=List[SubjectOut])
def list_my_subjects(
    auth: AuthContext = Depends(RequireRole(["teacher", "hod", "dean", "admin"])),
    db: Session = Depends(get_db)
):
    """Return only subjects assigned to the currently logged-in teacher."""
    from uuid import UUID
    items = db.scalars(
        select(Subject).where(Subject.assigned_teacher_id == UUID(str(auth.user.id)))
    ).all()
    return items

@academic_router.get("/timetable", response_model=List[TimetableSlotOut])
def list_timetable(
    teacher_id: str = None,
    db: Session = Depends(get_db)
):
    stmt = select(TimetableSlot)
    if teacher_id:
        from uuid import UUID
        stmt = stmt.where(TimetableSlot.teacher_id == UUID(teacher_id))
    items = db.scalars(stmt).all()
    return items
