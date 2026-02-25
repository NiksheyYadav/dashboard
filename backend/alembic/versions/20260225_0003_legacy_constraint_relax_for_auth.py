"""relax legacy constraints for stage2 auth compatibility

Revision ID: 20260225_0003
Revises: 20260225_0002
Create Date: 2026-02-25 00:45:00
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "20260225_0003"
down_revision = "20260225_0002"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'username'
            ) THEN
                ALTER TABLE users ALTER COLUMN username DROP NOT NULL;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
            ) THEN
                ALTER TABLE users ALTER COLUMN full_name DROP NOT NULL;
            END IF;

            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'expires_at'
            ) THEN
                ALTER TABLE sessions ALTER COLUMN expires_at DROP NOT NULL;
            END IF;
        END $$;
        """
    )


def downgrade() -> None:
    pass
