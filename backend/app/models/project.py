import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, DateTime, String, Text, JSON, ForeignKey
from app.db.base import Base


class Project(Base):
    __tablename__ = "projects"

    id = Column(String(50), primary_key=True, default=lambda: f"proj-{uuid.uuid4().hex[:8]}")
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # Research, Dev, Industry, Other
    description = Column(Text, nullable=False)
    start_date = Column(String(20), nullable=False)
    end_date = Column(String(20), nullable=False)
    status = Column(String(50), nullable=False, default="Pending Approval")  # Pending Approval, Active, Completed, Rejected
    flow = Column(String(20), nullable=False, default="internal")  # internal or external
    ppt_file = Column(JSON, nullable=True)  # {name, url, uploadedAt}
    created_by = Column(String(150), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    faculty_coordinator = Column(JSON, nullable=False)  # {id, name, email, department, role} - internal coordinator
    external_faculty = Column(JSON, nullable=True)  # {id, name, email, department, role} - external faculty (only for external flow)
    approval_submitted_by = Column(String(150), nullable=False)  # always faculty_coordinator.id
    assigned_students = Column(JSON, nullable=True, default=[])  # [{id, name, rollNo, email, department}]
    rejection_reason = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
