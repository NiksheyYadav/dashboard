from __future__ import annotations

import enum
import uuid
from datetime import date
from decimal import Decimal

from sqlalchemy import Date, Enum, ForeignKey, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base, SoftDeleteMixin, TimestampMixin, UUIDPrimaryKeyMixin


class FeeStatus(str, enum.Enum):
    pending = "pending"
    paid = "paid"
    overdue = "overdue"
    partial = "partial"
    waived = "waived"


class FeeType(str, enum.Enum):
    tuition = "tuition"
    hostel = "hostel"
    transport = "transport"
    exam = "exam"
    library = "library"
    other = "other"


class FeeRecord(Base, UUIDPrimaryKeyMixin, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "fee_records"

    organization_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("organizations.id"), nullable=False)
    student_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("students.id"), nullable=False)

    fee_type: Mapped[FeeType] = mapped_column(Enum(FeeType, name="fee_type"), nullable=False)
    amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False)
    paid_amount: Mapped[Decimal] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[FeeStatus] = mapped_column(Enum(FeeStatus, name="fee_status"), nullable=False, default=FeeStatus.pending)

    semester: Mapped[int | None] = mapped_column(nullable=True)
    academic_year: Mapped[str | None] = mapped_column(String(20), nullable=True)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    remarks: Mapped[str | None] = mapped_column(Text, nullable=True)

    student = relationship("Student", backref="fee_records")
