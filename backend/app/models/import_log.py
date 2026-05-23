import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, ForeignKey, Integer, JSON, String, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class ImportLog(Base):
    __tablename__ = "import_logs"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    file_name: Mapped[str] = mapped_column(String(500), nullable=False)
    file_type: Mapped[str] = mapped_column(String(20), nullable=False)  # pdf, xlsx, csv
    import_type: Mapped[str] = mapped_column(String(50), nullable=False)  # timetable, faculty_mapping, subject_allocation, mentor_mapping, student_master
    uploaded_by: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    status: Mapped[str] = mapped_column(String(20), nullable=False, default="pending", server_default="pending")
    total_records: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    success_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    error_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    warnings_count: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    errors_json: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    preview_data: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    committed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    rolled_back_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now(), onupdate=func.now()
    )
