import uuid
from datetime import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PlacementRecord(Base):
    __tablename__ = "placement_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sl_no: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    roll_no: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(200), nullable=False)
    photo_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    type: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    contact_no: Mapped[Optional[str]] = mapped_column(String(30), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(320), nullable=True)
    x_result: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    xii_result: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    course: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    branch: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    designation: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    company_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    industry: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    date_of_drive: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    company_offers: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    probation_duration: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    stipend_per_month: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    package: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    offer_letter: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    hr_contact: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
