from __future__ import annotations

from datetime import datetime, timezone
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.announcement import Announcement, AnnouncementPriority
from app.models.user import User
from app.schemas.announcement import AnnouncementCreate, AnnouncementResponse, AnnouncementUpdate
from app.utils.deps import get_current_user, require_roles

router = APIRouter(prefix="/announcements", tags=["announcements"])


@router.post("", response_model=AnnouncementResponse, status_code=status.HTTP_201_CREATED)
def create_announcement(
    payload: AnnouncementCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod"})),
):
    try:
        priority = AnnouncementPriority(payload.priority)
    except ValueError:
        priority = AnnouncementPriority.normal

    announcement = Announcement(
        organization_id=current_user.organization_id,
        created_by=current_user.id,
        title=payload.title,
        message=payload.message,
        priority=priority,
        target_course=payload.target_course,
        target_semester=payload.target_semester,
    )
    db.add(announcement)
    db.commit()
    db.refresh(announcement)
    return _to_response(announcement, current_user)


@router.get("", response_model=list[AnnouncementResponse])
def list_announcements(
    priority: str | None = Query(default=None),
    course: str | None = Query(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Announcement).filter(Announcement.organization_id == current_user.organization_id, Announcement.is_deleted.is_(False))
    if priority:
        query = query.filter(Announcement.priority == priority)
    if course:
        query = query.filter(Announcement.target_course == course)

    announcements = query.order_by(Announcement.created_at.desc()).all()
    result = []
    for ann in announcements:
        author = db.query(User).filter(User.id == ann.created_by).first()
        result.append(_to_response(ann, author))
    return result


@router.get("/{announcement_id}", response_model=AnnouncementResponse)
def get_announcement(announcement_id: UUID, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id, Announcement.organization_id == current_user.organization_id, Announcement.is_deleted.is_(False)).first()
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")
    author = db.query(User).filter(User.id == announcement.created_by).first()
    return _to_response(announcement, author)


@router.put("/{announcement_id}", response_model=AnnouncementResponse)
def update_announcement(
    announcement_id: UUID,
    payload: AnnouncementUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod"})),
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id, Announcement.organization_id == current_user.organization_id, Announcement.is_deleted.is_(False)).first()
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    for key, value in payload.model_dump(exclude_none=True).items():
        if key == "priority":
            try:
                value = AnnouncementPriority(value)
            except ValueError:
                continue
        setattr(announcement, key, value)

    db.commit()
    db.refresh(announcement)
    return _to_response(announcement, current_user)


@router.delete("/{announcement_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_announcement(
    announcement_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_roles({"dean", "hod"})),
):
    announcement = db.query(Announcement).filter(Announcement.id == announcement_id, Announcement.organization_id == current_user.organization_id, Announcement.is_deleted.is_(False)).first()
    if not announcement:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Announcement not found")

    announcement.is_deleted = True
    announcement.deleted_at = datetime.now(timezone.utc)
    db.commit()
    return None


def _to_response(announcement: Announcement, author: User | None) -> dict:
    return {
        "id": announcement.id,
        "title": announcement.title,
        "message": announcement.message,
        "priority": announcement.priority.value,
        "target_course": announcement.target_course,
        "target_semester": announcement.target_semester,
        "created_by": announcement.created_by,
        "author_name": author.full_name if author else None,
        "author_role": author.role.value if author else None,
        "created_at": announcement.created_at,
    }
