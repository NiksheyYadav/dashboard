import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.modules.auth.service import AuthService
from fastapi import HTTPException

def main():
    with open(os.path.join(os.path.dirname(__file__), "admin_create_log.txt"), "w") as f:
        session = SessionLocal()
        try:
            f.write("Attempting to create admin user...\n")
            user = AuthService.register_user(
                session, 
                email="admin@sgtuniversity.edu", 
                password="DemoPass123!",
                department="Administration"
            )
            f.write(f"Success! Created admin account (id={user.id})\n")
        except HTTPException as exc:
            if exc.status_code == 409:
                f.write("admin@sgtuniversity.edu already exists.\n")
            else:
                f.write(f"HTTPException: {exc.detail}\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
        finally:
            session.close()

if __name__ == "__main__":
    main()
