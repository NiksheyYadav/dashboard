"""create students table

Revision ID: 20260227_0004
Revises: 20260225_0003
Create Date: 2026-02-27
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260227_0004"
down_revision: Union[str, None] = "20260225_0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "students",
        sa.Column("id", sa.dialects.postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("roll_no", sa.String(50), nullable=False, unique=True, index=True),
        sa.Column("course", sa.String(100), nullable=False),
        sa.Column("department", sa.String(100), nullable=False),
        sa.Column("semester", sa.Integer, nullable=False, server_default="1"),
        sa.Column("email", sa.String(320), nullable=True),
        sa.Column("phone", sa.String(30), nullable=True),
        sa.Column("cv_status", sa.String(20), nullable=False, server_default="PENDING"),
        sa.Column("attendance_percent", sa.Float, nullable=False, server_default="0.0"),
        sa.Column("status", sa.String(20), nullable=False, server_default="Active"),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
    )


def downgrade() -> None:
    op.drop_table("students")
