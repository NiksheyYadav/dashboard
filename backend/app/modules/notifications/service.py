from typing import List, Optional
from uuid import UUID
from sqlalchemy.orm import Session
from sqlalchemy import select, update

from app.models.notification import Notification


class NotificationService:
    @staticmethod
    def get_user_notifications(db: Session, user_id: str, unread_only: bool = False) -> list:
        stmt = select(Notification).where(
            Notification.user_id == UUID(user_id)
        ).order_by(Notification.created_at.desc()).limit(50)
        if unread_only:
            stmt = stmt.where(Notification.is_read == False)
        notifs = db.scalars(stmt).all()
        return [
            {
                "id": str(n.id),
                "type": n.type,
                "title": n.title,
                "message": n.message,
                "is_read": n.is_read,
                "entity_type": n.entity_type,
                "entity_id": n.entity_id,
                "created_at": str(n.created_at),
            }
            for n in notifs
        ]

    @staticmethod
    def get_unread_count(db: Session, user_id: str) -> int:
        from sqlalchemy import func
        return db.query(func.count(Notification.id)).filter(
            Notification.user_id == UUID(user_id),
            Notification.is_read == False
        ).scalar() or 0

    @staticmethod
    def mark_as_read(db: Session, user_id: str, notification_id: str = None) -> dict:
        if notification_id:
            notif = db.get(Notification, UUID(notification_id))
            if notif and str(notif.user_id) == user_id:
                notif.is_read = True
                db.commit()
                return {"marked": 1}
        else:
            # Mark all as read
            count = db.query(Notification).filter(
                Notification.user_id == UUID(user_id),
                Notification.is_read == False
            ).update({"is_read": True})
            db.commit()
            return {"marked": count}
        return {"marked": 0}

    @staticmethod
    def create_notification(
        db: Session, user_id: str, notif_type: str,
        title: str, message: str,
        entity_type: str = None, entity_id: str = None
    ) -> dict:
        notif = Notification(
            user_id=UUID(user_id),
            type=notif_type,
            title=title,
            message=message,
            entity_type=entity_type,
            entity_id=entity_id,
            is_read=False,
        )
        db.add(notif)
        db.commit()
        db.refresh(notif)
        return {"id": str(notif.id), "title": notif.title}
