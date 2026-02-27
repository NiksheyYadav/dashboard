import os
import sys
from sqlalchemy import text

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import engine

def main():
    with open(os.path.join(os.path.dirname(__file__), "db_log.txt"), "w") as f:
        try:
            with engine.connect() as conn:
                f.write("Connected to database. Checking columns...\n")
                result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users'"))
                cols = [row[0] for row in result.fetchall()]
                f.write(f"Columns in users: {cols}\n")
                
                if 'department' not in cols:
                    f.write("Column 'department' is missing. Adding it now...\n")
                    # Try using autocommit
                    conn.execute(text("COMMIT")) # finish any open trans
                    conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(100)"))
                    f.write("Executed ALTER TABLE\n")
                else:
                    f.write("'department' column already exists.\n")
        except Exception as e:
            f.write(f"Error checking/updating db: {e}\n")

if __name__ == "__main__":
    main()
