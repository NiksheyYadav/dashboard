import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import alembic.config

def main():
    args = ["--raiseerr", "revision", "--autogenerate", "-m", "add_department_to_users"]
    try:
        alembic.config.main(argv=args)
        print("Alembic revision created successfully.")
    except Exception as e:
        print(f"Error running alembic: {e}")

if __name__ == "__main__":
    main()
