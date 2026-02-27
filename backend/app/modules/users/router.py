from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.modules.auth.dependencies import AuthContext, RequireRole
from app.modules.users.schemas import UserResponse

users_router = APIRouter(prefix="/users", tags=["users"])


@users_router.get("", response_model=list[UserResponse])
def list_users(
    auth: AuthContext = Depends(RequireRole(["admin"])),
    db: Session = Depends(get_db),
) -> list[User]:
    """Retrieve all users. Restricted to Admin."""
    return list(db.scalars(select(User).order_by(User.created_at.desc())).all())


@users_router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    auth: AuthContext = Depends(RequireRole(["admin"])),
    db: Session = Depends(get_db),
) -> None:
    """Delete a user. Restricted to Admin."""
    user = db.scalar(select(User).where(User.id == user_id))
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
        
    if str(user.id) == str(auth.user.id):
        raise HTTPException(status_code=400, detail="Cannot delete yourself")
        
    db.delete(user)
    db.commit()
