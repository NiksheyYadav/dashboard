from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.auth.service import AuthService

DEMO_USERS = [
    {"email": "admin@sgtuniversity.edu", "password": "DemoPass123!", "department": "Administration"},
    {"email": "dean@sgtuniversity.edu", "password": "DemoPass123!", "department": "All"},
    {"email": "hod@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech CS"},
    {"email": "hod_it@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech IT"},
    {"email": "coordinator@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech CS"},
    {"email": "faculty@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech CS"},
]


def main() -> None:
    session: Session = SessionLocal()
    try:
        for user_data in DEMO_USERS:
            try:
                user = AuthService.register_user(
                    session, 
                    email=user_data["email"], 
                    password=user_data["password"],
                    department=user_data["department"]
                )
            except HTTPException as exc:
                if exc.status_code == 409:
                    print(f"{user_data['email']} already exists, skipping.")
                    continue
                raise
            print(f"Created demo account: {user_data['email']} (id={user.id}, dept={user.department})")
    finally:
        session.close()


if __name__ == "__main__":
    main()
