import logging
import uuid
from datetime import datetime, timezone
from typing import Optional, List

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.project import Project
from app.models.user import User
from app.modules.auth.dependencies import get_current_user

logger = logging.getLogger(__name__)

projects_router = APIRouter(prefix="/projects", tags=["projects"])


# Pydantic Models
class FacultyInfo(BaseModel):
    id: str
    name: str
    email: str
    department: str
    role: str


class AssignedStudent(BaseModel):
    id: str
    name: str
    rollNo: str
    email: str
    department: str


class PPTFile(BaseModel):
    name: str
    url: str
    uploadedAt: str


class ProjectCreate(BaseModel):
    title: str
    type: str  # Research, Dev, Industry, Other
    description: str
    startDate: str
    endDate: str
    flow: str  # "internal" or "external"
    externalFaculty: Optional[FacultyInfo] = None


class ProjectUpdate(BaseModel):
    title: Optional[str] = None
    type: Optional[str] = None
    description: Optional[str] = None
    startDate: Optional[str] = None
    endDate: Optional[str] = None
    status: Optional[str] = None
    rejectionReason: Optional[str] = None
    notes: Optional[str] = None


class ProjectOut(BaseModel):
    id: str
    title: str
    type: str
    description: str
    startDate: str
    endDate: str
    status: str
    pptFile: Optional[PPTFile] = None
    createdBy: str
    createdAt: str
    updatedAt: str
    internalFaculty: FacultyInfo
    externalFaculty: Optional[FacultyInfo] = None
    assignedStudents: List[AssignedStudent]
    rejectionReason: Optional[str] = None
    notes: Optional[str] = None

    class Config:
        from_attributes = True


def _to_out(p: Project) -> dict:
    """Convert DB model to frontend-compatible dict."""
    return {
        "id": p.id,
        "title": p.title,
        "type": p.type,
        "description": p.description,
        "startDate": p.start_date,
        "endDate": p.end_date,
        "status": p.status,
        "flow": p.flow,
        "pptFile": p.ppt_file,
        "createdBy": p.created_by,
        "createdAt": p.created_at.isoformat() if p.created_at else "",
        "updatedAt": p.updated_at.isoformat() if p.updated_at else "",
        "facultyCoordinator": p.faculty_coordinator,
        "externalFaculty": p.external_faculty,
        "approvalSubmittedBy": p.approval_submitted_by,
        "assignedStudents": p.assigned_students or [],
        "rejectionReason": p.rejection_reason,
        "notes": p.notes,
    }


@projects_router.get("")
def list_projects(
    status: Optional[str] = None,
    type_filter: Optional[str] = None,
    search: Optional[str] = None,
    db: Session = Depends(get_db),
):
    """List all projects with optional filtering."""
    query = db.query(Project).order_by(Project.created_at.desc())
    
    if status:
        query = query.filter(Project.status == status)
    
    if type_filter:
        query = query.filter(Project.type == type_filter)
    
    if search:
        query = query.filter(
            (Project.title.ilike(f"%{search}%")) | 
            (Project.description.ilike(f"%{search}%"))
        )
    
    return [_to_out(p) for p in query.all()]


@projects_router.get("/{project_id}")
def get_project(project_id: str, db: Session = Depends(get_db)):
    """Get a single project by ID."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return _to_out(project)


@projects_router.post("", status_code=201)
def create_project(
    body: ProjectCreate, 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project."""
    project = Project(
        title=body.title,
        type=body.type,
        description=body.description,
        start_date=body.startDate,
        end_date=body.endDate,
        status="Pending Approval",
        flow=body.flow,
        created_by=str(current_user.id),
        created_at=datetime.now(timezone.utc),
        updated_at=datetime.now(timezone.utc),
        faculty_coordinator={
            "id": str(current_user.id),
            "name": current_user.email.split("@")[0],  # Use email prefix as name if not available
            "email": current_user.email,
            "department": current_user.department or "Unknown",
            "role": "Internal",
        },
        external_faculty=body.externalFaculty.dict() if body.externalFaculty else None,
        approval_submitted_by=str(current_user.id),
        assigned_students=[],
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    logger.info(f"Created project: {project.id} by coordinator {current_user.id}")
    return _to_out(project)


@projects_router.put("/{project_id}")
def update_project(project_id: str, body: ProjectUpdate, db: Session = Depends(get_db)):
    """Update a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if body.title:
        project.title = body.title
    if body.type:
        project.type = body.type
    if body.description:
        project.description = body.description
    if body.startDate:
        project.start_date = body.startDate
    if body.endDate:
        project.end_date = body.endDate
    if body.status:
        project.status = body.status
    if body.rejectionReason:
        project.rejection_reason = body.rejectionReason
    if body.notes:
        project.notes = body.notes
    
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    logger.info(f"Updated project: {project.id}")
    return _to_out(project)


@projects_router.delete("/{project_id}")
def delete_project(project_id: str, db: Session = Depends(get_db)):
    """Delete a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    db.delete(project)
    db.commit()
    logger.info(f"Deleted project: {project.id}")
    return {"message": "Project deleted successfully"}


@projects_router.post("/{project_id}/approve")
def approve_project(project_id: str, db: Session = Depends(get_db)):
    """Approve a pending project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.status != "Pending Approval":
        raise HTTPException(status_code=400, detail="Only pending projects can be approved")
    
    project.status = "Active"
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    logger.info(f"Approved project: {project.id}")
    return _to_out(project)


@projects_router.post("/{project_id}/reject")
def reject_project(project_id: str, reason: str, db: Session = Depends(get_db)):
    """Reject a pending project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    if project.status != "Pending Approval":
        raise HTTPException(status_code=400, detail="Only pending projects can be rejected")
    
    project.status = "Rejected"
    project.rejection_reason = reason
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    logger.info(f"Rejected project: {project.id}")
    return _to_out(project)


@projects_router.post("/{project_id}/students")
def add_student_to_project(
    project_id: str, 
    student: AssignedStudent, 
    db: Session = Depends(get_db)
):
    """Add a student to a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    students = project.assigned_students or []
    
    # Check if student already assigned
    if any(s["id"] == student.id for s in students):
        raise HTTPException(status_code=400, detail="Student already assigned to this project")
    
    students.append(student.dict())
    project.assigned_students = students
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    logger.info(f"Added student {student.id} to project {project.id}")
    return _to_out(project)


@projects_router.delete("/{project_id}/students/{student_id}")
def remove_student_from_project(
    project_id: str,
    student_id: str,
    db: Session = Depends(get_db)
):
    """Remove a student from a project."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    students = project.assigned_students or []
    updated_students = [s for s in students if s["id"] != student_id]
    
    if len(updated_students) == len(students):
        raise HTTPException(status_code=404, detail="Student not found in project")
    
    project.assigned_students = updated_students
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    logger.info(f"Removed student {student_id} from project {project.id}")
    return _to_out(project)


@projects_router.post("/{project_id}/complete")
def complete_project(project_id: str, db: Session = Depends(get_db)):
    """Mark a project as completed."""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    project.status = "Completed"
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    logger.info(f"Completed project: {project.id}")
    return _to_out(project)
