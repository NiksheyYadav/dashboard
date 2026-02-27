"""stage2 auth schema reconcile for existing databases

Revision ID: 20260225_0002
Revises: 20260225_0001
Create Date: 2026-02-25 00:30:00
"""

from alembic import op

# revision identifiers, used by Alembic.
revision = "20260225_0002"
down_revision = "20260225_0001"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'status'
            ) THEN
                ALTER TABLE users ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'is_active'
            ) THEN
                UPDATE users
                SET status = CASE WHEN is_active THEN 'ACTIVE' ELSE 'INACTIVE' END
                WHERE status IS NULL OR status = '';
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'failed_login_count'
            ) THEN
                ALTER TABLE users ADD COLUMN failed_login_count INTEGER NOT NULL DEFAULT 0;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'failed_login_attempts'
            ) THEN
                UPDATE users
                SET failed_login_count = COALESCE(failed_login_attempts, 0)
                WHERE failed_login_count IS NULL;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'ip'
            ) THEN
                ALTER TABLE sessions ADD COLUMN ip VARCHAR(45) NULL;
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'started_at'
            ) THEN
                ALTER TABLE sessions ADD COLUMN started_at TIMESTAMPTZ NULL;
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'last_seen_at'
            ) THEN
                ALTER TABLE sessions ADD COLUMN last_seen_at TIMESTAMPTZ NULL;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'ip_address'
            ) THEN
                UPDATE sessions SET ip = COALESCE(ip, ip_address);
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'created_at'
            ) THEN
                UPDATE sessions SET started_at = COALESCE(started_at, created_at);
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'last_activity_at'
            ) THEN
                UPDATE sessions SET last_seen_at = COALESCE(last_seen_at, last_activity_at, started_at, NOW());
            END IF;
        END $$;
        """
    )

    op.execute("ALTER TABLE sessions ALTER COLUMN started_at SET DEFAULT NOW();")
    op.execute("ALTER TABLE sessions ALTER COLUMN last_seen_at SET DEFAULT NOW();")

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'started_at') THEN
                UPDATE sessions SET started_at = NOW() WHERE started_at IS NULL;
                ALTER TABLE sessions ALTER COLUMN started_at SET NOT NULL;
            END IF;

            IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'sessions' AND column_name = 'last_seen_at') THEN
                UPDATE sessions SET last_seen_at = NOW() WHERE last_seen_at IS NULL;
                ALTER TABLE sessions ALTER COLUMN last_seen_at SET NOT NULL;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'user_id'
            ) THEN
                ALTER TABLE refresh_tokens ADD COLUMN user_id UUID NULL;
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'created_at'
            ) THEN
                ALTER TABLE refresh_tokens ADD COLUMN created_at TIMESTAMPTZ NULL;
            END IF;

            IF NOT EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'rotated_from'
            ) THEN
                ALTER TABLE refresh_tokens ADD COLUMN rotated_from UUID NULL;
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        UPDATE refresh_tokens rt
        SET user_id = CASE
            WHEN s.user_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                THEN s.user_id::text::uuid
            ELSE NULL
        END
        FROM sessions s
        WHERE rt.session_id = s.id AND rt.user_id IS NULL;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'issued_at'
            ) THEN
                UPDATE refresh_tokens SET created_at = COALESCE(created_at, issued_at, NOW());
            END IF;
        END $$;
        """
    )

    op.execute(
        """
        DO $$
        BEGIN
            IF EXISTS (
                SELECT 1
                FROM information_schema.columns
                WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'rotated_from_token_id'
            ) THEN
                UPDATE refresh_tokens
                SET rotated_from = CASE
                    WHEN rotated_from IS NOT NULL THEN rotated_from
                    WHEN rotated_from_token_id::text ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$'
                        THEN rotated_from_token_id::text::uuid
                    ELSE NULL
                END;
            END IF;
        END $$;
        """
    )

    op.execute("UPDATE refresh_tokens SET created_at = NOW() WHERE created_at IS NULL;")
    op.execute("ALTER TABLE refresh_tokens ALTER COLUMN created_at SET DEFAULT NOW();")
    op.execute("ALTER TABLE refresh_tokens ALTER COLUMN created_at SET NOT NULL;")

    op.execute(
        """
        DO $$
        DECLARE
            users_id_type text;
            refresh_user_id_type text;
            refresh_id_type text;
            refresh_rotated_from_type text;
        BEGIN
            SELECT data_type INTO users_id_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'id';

            SELECT data_type INTO refresh_user_id_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'user_id';

            SELECT data_type INTO refresh_id_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'id';

            SELECT data_type INTO refresh_rotated_from_type
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'refresh_tokens' AND column_name = 'rotated_from';

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_refresh_tokens_user_id_users'
            ) AND users_id_type = 'uuid' AND refresh_user_id_type = 'uuid' THEN
                ALTER TABLE refresh_tokens
                    ADD CONSTRAINT fk_refresh_tokens_user_id_users
                    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;
            END IF;

            IF NOT EXISTS (
                SELECT 1 FROM pg_constraint WHERE conname = 'fk_refresh_tokens_rotated_from_refresh_tokens'
            ) AND refresh_id_type = 'uuid' AND refresh_rotated_from_type = 'uuid' THEN
                ALTER TABLE refresh_tokens
                    ADD CONSTRAINT fk_refresh_tokens_rotated_from_refresh_tokens
                    FOREIGN KEY (rotated_from) REFERENCES refresh_tokens(id) ON DELETE SET NULL;
            END IF;
        END $$;
        """
    )

    op.execute("CREATE INDEX IF NOT EXISTS ix_sessions_user_id ON sessions (user_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_session_id ON refresh_tokens (session_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_user_id ON refresh_tokens (user_id);")
    op.execute("CREATE INDEX IF NOT EXISTS ix_refresh_tokens_expires_at ON refresh_tokens (expires_at);")
    op.execute("CREATE UNIQUE INDEX IF NOT EXISTS uq_refresh_tokens_token_hash ON refresh_tokens (token_hash);")


def downgrade() -> None:
    pass
