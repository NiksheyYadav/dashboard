import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from app.db.session import engine

def main():
    try:
        with engine.connect() as conn:
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='department'"))
            if result.fetchone():
                print("SUCCESS: 'department' column exists in 'users' table.")
            else:
                print("FAILURE: 'department' column is MISSING.")
    except Exception as e:
        print(f"Error checking db: {e}")

if __name__ == "__main__":
    main()
