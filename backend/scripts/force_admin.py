import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User
from app.core.security import hash_password, normalize_email

def main():
    log_path = os.path.join(os.path.dirname(__file__), "admin_force_log.txt")
    with open(log_path, "w") as f:
        session = SessionLocal()
        try:
            email = "admin@sgtuniversity.edu"
            normalized = normalize_email(email)
            password = "DemoPass123!"
            
            f.write(f"Looking up {normalized}...\n")
            user = session.query(User).filter(User.email == normalized).first()
            
            if user:
                f.write(f"User EXISTS. Updating password hash...\n")
                user.password_hash = hash_password(password)
                user.status = "ACTIVE"
                user.locked_until = None
                user.failed_login_count = 0
                session.commit()
                f.write(f"SUCCESS: Updated existing admin user (id={user.id})\n")
            else:
                f.write(f"User does NOT exist. Creating new profile...\n")
                new_user = User(
                    email=normalized,
                    password_hash=hash_password(password),
                    department="Administration"
                )
                session.add(new_user)
                session.commit()
                f.write(f"SUCCESS: Created new admin user (id={new_user.id})\n")
        except Exception as e:
            f.write(f"Error: {e}\n")
        finally:
            session.close()

if __name__ == "__main__":
    main()
