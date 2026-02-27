"""Quick script to create anonymous_messages table if it doesn't exist."""
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import SessionLocal

db = SessionLocal()
try:
    db.execute(text("""
        CREATE TABLE IF NOT EXISTS anonymous_messages (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            message TEXT NOT NULL,
            status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
    """))
    db.commit()
    print("OK: anonymous_messages table ready")
except Exception as e:
    print(f"ERROR: {e}")
finally:
    db.close()
