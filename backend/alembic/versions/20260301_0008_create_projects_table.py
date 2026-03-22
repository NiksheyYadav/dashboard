"""create projects table

Revision ID: 20260301_0008
Revises: 20260228_0007
Create Date: 2026-03-01
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260301_0008"
down_revision: Union[str, None] = "20260228_0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "projects",
        sa.Column("id", sa.String(50), primary_key=True),
        sa.Column("title", sa.String(255), nullable=False),
        sa.Column("type", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("start_date", sa.String(50), nullable=False),
        sa.Column("end_date", sa.String(50), nullable=False),
        sa.Column("status", sa.String(50), nullable=False, server_default="Pending Approval"),
        sa.Column("ppt_file", sa.JSON, nullable=True),
        sa.Column("created_by", sa.String(50), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False, server_default=sa.func.now()),
        sa.Column("internal_faculty", sa.JSON, nullable=False),
        sa.Column("external_faculty", sa.JSON, nullable=True),
        sa.Column("assigned_students", sa.JSON, nullable=True),
        sa.Column("rejection_reason", sa.Text, nullable=True),
        sa.Column("notes", sa.Text, nullable=True),
    )


def downgrade() -> None:
    op.drop_table("projects")
