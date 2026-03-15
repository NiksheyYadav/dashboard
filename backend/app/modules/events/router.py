import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.event import Event
from app.modules.auth.dependencies import AuthContext, get_auth_context

logger = logging.getLogger(__name__)

events_router = APIRouter(prefix="/events", tags=["events"])


class EventCreate(BaseModel):
    eventName: str
    roomNumber: str
    date: str
    timeSlot: str


class EventOut(BaseModel):
    id: str
    eventName: str
    roomNumber: str
    date: str
    timeSlot: str
    bookedBy: str
    status: str


def _to_out(e: Event) -> dict:
    return {
        "id": e.id,
        "eventName": e.event_name,
        "roomNumber": e.room_number,
        "date": e.date,
        "timeSlot": e.time_slot,
        "bookedBy": e.booked_by,
        "status": e.status,
    }


@events_router.get("")
def list_events(
    search: str = Query(default=""),
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
):
    query = db.query(Event).order_by(Event.created_at.desc())
    if search:
        term = f"%{search}%"
        query = query.filter(
            Event.event_name.ilike(term) | Event.room_number.ilike(term)
        )
    return [_to_out(e) for e in query.all()]


@events_router.post("", status_code=201)
def create_event(
    body: EventCreate,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
):
    event = Event(
        event_name=body.eventName,
        room_number=body.roomNumber,
        date=body.date,
        time_slot=body.timeSlot,
        booked_by=auth.user.email,
        status="pending",
        created_at=datetime.now(timezone.utc),
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    logger.info(f"Created event: {event.id}")
    return _to_out(event)


@events_router.delete("/{event_id}")
def delete_event(
    event_id: str,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
):
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    db.delete(event)
    db.commit()
    logger.info(f"Deleted event: {event_id}")
    return {"detail": "Deleted"}
