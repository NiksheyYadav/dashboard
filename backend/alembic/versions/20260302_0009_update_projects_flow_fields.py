"""update projects table with flow and facultyCoordinator fields

Revision ID: 20260302_0009
Revises: 20260301_0008
Create Date: 2026-03-02
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op

revision: str = "20260302_0009"
down_revision: Union[str, None] = "20260301_0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new columns
    op.add_column("projects", sa.Column("flow", sa.String(20), nullable=False, server_default="internal"))
    op.add_column("projects", sa.Column("approval_submitted_by", sa.String(150), nullable=True))
    
    # Rename internal_faculty to faculty_coordinator
    op.alter_column("projects", "internal_faculty", new_column_name="faculty_coordinator")


def downgrade() -> None:
    # Rename faculty_coordinator back to internal_faculty
    op.alter_column("projects", "faculty_coordinator", new_column_name="internal_faculty")
    
    # Remove new columns
    op.drop_column("projects", "approval_submitted_by")
    op.drop_column("projects", "flow")
