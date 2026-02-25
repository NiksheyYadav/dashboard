from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.db.session import SessionLocal
from app.modules.auth.service import AuthService

DEMO_USERS = [
    ("dean@example.com", "DemoPass123!"),
    ("hod@example.com", "DemoPass123!"),
    ("coordinator@example.com", "DemoPass123!"),
    ("faculty@example.com", "DemoPass123!"),
]


def main() -> None:
    session: Session = SessionLocal()
    try:
        for email, password in DEMO_USERS:
            try:
                user = AuthService.register_user(session, email=email, password=password)
            except HTTPException as exc:
                if exc.status_code == 409:
                    print(f"{email} already exists, skipping.")
                    continue
                raise
            print(f"Created demo account: {email} (id={user.id})")
    finally:
        session.close()


if __name__ == "__main__":
    main()
