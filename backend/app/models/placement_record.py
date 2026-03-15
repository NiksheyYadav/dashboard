import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, Integer, String, Text, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class PlacementRecord(Base):
    __tablename__ = "placement_records"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sl_no: Mapped[int | None] = mapped_column(Integer, nullable=True)
    roll_no: Mapped[str] = mapped_column(String(50), index=True, nullable=False)
    student_name: Mapped[str] = mapped_column(String(200), nullable=False)
    photo_id: Mapped[str | None] = mapped_column(String(100), nullable=True)
    gender: Mapped[str | None] = mapped_column(String(20), nullable=True)
    type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    contact_no: Mapped[str | None] = mapped_column(String(30), nullable=True)
    email: Mapped[str | None] = mapped_column(String(320), nullable=True)
    x_result: Mapped[str | None] = mapped_column(String(20), nullable=True)
    xii_result: Mapped[str | None] = mapped_column(String(20), nullable=True)
    course: Mapped[str | None] = mapped_column(String(100), nullable=True)
    branch: Mapped[str | None] = mapped_column(String(100), nullable=True)
    designation: Mapped[str | None] = mapped_column(String(100), nullable=True)
    company_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    industry: Mapped[str | None] = mapped_column(String(100), nullable=True)
    date_of_drive: Mapped[str | None] = mapped_column(String(50), nullable=True)
    company_offers: Mapped[str | None] = mapped_column(String(200), nullable=True)
    probation_duration: Mapped[str | None] = mapped_column(String(100), nullable=True)
    stipend_per_month: Mapped[str | None] = mapped_column(String(50), nullable=True)
    package: Mapped[str | None] = mapped_column(String(50), nullable=True)
    offer_letter: Mapped[str | None] = mapped_column(String(10), nullable=True)
    hr_contact: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
