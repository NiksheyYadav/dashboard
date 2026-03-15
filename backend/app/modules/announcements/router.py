import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.announcement import Announcement

logger = logging.getLogger(__name__)

announcements_router = APIRouter(prefix="/announcements", tags=["announcements"])


class AnnouncementCreate(BaseModel):
    title: str
    message: str
    author: str
    author_role: str = "faculty"
    target_course: str = "all"
    target_semester: str = "all"
    priority: str = "normal"


class AnnouncementOut(BaseModel):
    id: str
    title: str
    message: str
    author: str
    authorRole: str
    targetCourse: str
    targetSemester: Union[str, int]
    createdAt: str
    priority: str

    class Config:
        from_attributes = True


def _to_out(a: Announcement) -> dict:
    """Convert DB model to frontend-compatible dict."""
    semester = a.target_semester
    try:
        semester = int(semester)
    except (ValueError, TypeError):
        pass
    return {
        "id": a.id,
        "title": a.title,
        "message": a.message,
        "author": a.author,
        "authorRole": a.author_role,
        "targetCourse": a.target_course,
        "targetSemester": semester,
        "createdAt": a.created_at.isoformat() if a.created_at else "",
        "priority": a.priority,
    }


from typing import Optional, Union

@announcements_router.get("")
def list_announcements(
    course: Optional[str] = None,
    semester: Optional[str] = None,
    db: Session = Depends(get_db),
):
    query = db.query(Announcement).order_by(Announcement.created_at.desc())
    if course and course != "all":
        query = query.filter(
            (Announcement.target_course == course) | (Announcement.target_course == "all")
        )
    if semester and semester != "all":
        query = query.filter(
            (Announcement.target_semester == semester) | (Announcement.target_semester == "all")
        )
    return [_to_out(a) for a in query.all()]


@announcements_router.post("", status_code=201)
def create_announcement(body: AnnouncementCreate, db: Session = Depends(get_db)):
    ann = Announcement(
        title=body.title,
        message=body.message,
        author=body.author,
        author_role=body.author_role,
        target_course=body.target_course,
        target_semester=str(body.target_semester),
        created_at=datetime.now(timezone.utc),
        priority=body.priority,
    )
    db.add(ann)
    db.commit()
    db.refresh(ann)
    logger.info(f"Created announcement: {ann.id}")
    return _to_out(ann)


@announcements_router.delete("/{announcement_id}")
def delete_announcement(announcement_id: str, db: Session = Depends(get_db)):
    ann = db.query(Announcement).filter(Announcement.id == announcement_id).first()
    if not ann:
        raise HTTPException(status_code=404, detail="Announcement not found")
    db.delete(ann)
    db.commit()
    logger.info(f"Deleted announcement: {announcement_id}")
    return {"detail": "Deleted"}
