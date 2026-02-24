from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel


class FeeCreate(BaseModel):
    student_id: UUID
    fee_type: str
    amount: Decimal
    semester: int | None = None
    academic_year: str | None = None
    due_date: date | None = None
    remarks: str | None = None


class FeeUpdate(BaseModel):
    paid_amount: Decimal | None = None
    status: str | None = None
    remarks: str | None = None


class FeeResponse(BaseModel):
    id: UUID
    student_id: UUID
    student_name: str | None = None
    fee_type: str
    amount: Decimal
    paid_amount: Decimal
    status: str
    semester: int | None
    academic_year: str | None
    due_date: date | None
    remarks: str | None
    created_at: datetime

    model_config = {"from_attributes": True}


class FeeSummaryResponse(BaseModel):
    total_records: int
    total_amount: float
    total_collected: float
    total_pending: float
    paid_count: int
    pending_count: int
    overdue_count: int
