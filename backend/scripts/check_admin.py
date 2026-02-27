import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.db.session import SessionLocal
from app.models.user import User

def main():
    with open(os.path.join(os.path.dirname(__file__), "admin_check.txt"), "w") as f:
        try:
            db = SessionLocal()
            u = db.query(User).filter_by(email='admin@sgtuniversity.edu').first()
            if u:
                f.write(f"USER EXISTS: id={u.id}, email={u.email}, status={u.status}, dept={u.department}\n")
            else:
                f.write("USER DOES NOT EXIST in database.\n")
        except Exception as e:
            f.write(f"Error checking user: {e}\n")

if __name__ == "__main__":
    main()
