import os
import sys
from sqlalchemy import text

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine

def main():
    with open(os.path.join(os.path.dirname(__file__), "db_log.txt"), "w") as f:
        try:
            with engine.connect() as conn:
                f.write("Connected to database. Checking columns...\n")
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='department'"))
                if not result.fetchone():
                    f.write("Column 'department' is missing. Adding it now...\n")
                    conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(100)"))
                    conn.commit()
                    f.write("Successfully added 'department' column to users table.\n")
                else:
                    f.write("'department' column already exists.\n")
        except Exception as e:
            f.write(f"Error checking/updating db: {e}\n")

if __name__ == "__main__":
    main()
