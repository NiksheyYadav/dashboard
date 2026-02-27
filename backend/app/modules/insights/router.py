from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, Query
from sqlalchemy import String, cast, func, select
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.session import Session as UserSession
from app.models.user import User
from app.modules.auth.dependencies import AuthContext, get_auth_context
from app.modules.insights.schemas import (
    DashboardStatsResponse,
    DistributionResponse,
    PaginatedStudentsResponse,
    StudentResponse,
    TopPerformerResponse,
    WeeklyTrendResponse,
)

insights_router = APIRouter(tags=["insights"])


def _name_from_email(email: str) -> str:
    local_part = email.split("@")[0].replace(".", " ").replace("_", " ").replace("-", " ")
    parts = [part for part in local_part.split() if part]
    return " ".join(part.capitalize() for part in parts) or "User"


def _role_course_from_email(email: str) -> str:
    value = email.lower()
    if "dean" in value:
        return "B.Tech CS"
    if "hod" in value:
        return "B.Tech IT"
    if "coord" in value:
        return "B.Tech ECE"
    return "B.Tech CS"


def _roll_from_user_id(user_id: str) -> str:
    return f"SGT-{user_id.replace('-', '').upper()[:8]}"


def _attendance_from_sessions(session_count: int, max_sessions: int) -> float:
    if max_sessions <= 0:
        return 75.0
    normalized = session_count / max_sessions
    return round(70 + (normalized * 29), 1)


@insights_router.get("/analytics/summary", response_model=DashboardStatsResponse)
def analytics_summary(
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> DashboardStatsResponse:
    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    active_users = db.scalar(
        select(func.count(func.distinct(UserSession.user_id))).where(UserSession.revoked_at.is_(None))
    ) or 0
    locked_users = db.scalar(
        select(func.count()).select_from(User).where(User.locked_until.is_not(None), User.locked_until > datetime.now(timezone.utc))
    ) or 0

    avg_attendance = round((active_users / total_users) * 100, 1) if total_users else 0.0

    return DashboardStatsResponse(
        totalStudents=total_users,
        totalStudentsTrend=0.0,
        cvsUploaded=active_users,
        cvsUploadedLabel="Live from backend",
        avgAttendance=avg_attendance,
        avgAttendanceTrend=0.0,
        lowAttendance=max(total_users - active_users, 0),
    )


@insights_router.get("/attendance/top", response_model=list[TopPerformerResponse])
def attendance_top(
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[TopPerformerResponse]:
    users = db.scalars(select(User).order_by(User.created_at.desc()).limit(6)).all()
    if not users:
        return []

    session_counts: dict[str, int] = {}
    for user in users:
        count = db.scalar(
            select(func.count()).select_from(UserSession).where(cast(UserSession.user_id, String) == str(user.id))
        ) or 0
        session_counts[str(user.id)] = count

    max_sessions = max(session_counts.values()) if session_counts else 0

    performers = [
        TopPerformerResponse(
            name=_name_from_email(user.email),
            attendance=_attendance_from_sessions(session_counts.get(str(user.id), 0), max_sessions),
        )
        for user in users
    ]

    return sorted(performers, key=lambda item: item.attendance, reverse=True)[:5]


@insights_router.get("/attendance/weekly", response_model=list[WeeklyTrendResponse])
def attendance_weekly(
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> list[WeeklyTrendResponse]:
    today = datetime.now(timezone.utc).date()
    results: list[WeeklyTrendResponse] = []

    for day_offset in range(6, -1, -1):
        day = today - timedelta(days=day_offset)
        next_day = day + timedelta(days=1)

        count = db.scalar(
            select(func.count())
            .select_from(UserSession)
            .where(UserSession.started_at >= day, UserSession.started_at < next_day)
        ) or 0

        attendance = min(100.0, 70.0 + (count * 5.0))
        results.append(WeeklyTrendResponse(week=day.strftime("%a"), attendance=round(attendance, 1)))

    return results


@insights_router.get("/attendance/summary", response_model=DistributionResponse)
def attendance_summary(
    _: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> DistributionResponse:
    total_users = db.scalar(select(func.count()).select_from(User)) or 0
    present = db.scalar(
        select(func.count(func.distinct(UserSession.user_id))).where(UserSession.revoked_at.is_(None))
    ) or 0
    leave = db.scalar(
        select(func.count()).select_from(User).where(User.locked_until.is_not(None), User.locked_until > datetime.now(timezone.utc))
    ) or 0
    absent = max(total_users - present - leave, 0)

    return DistributionResponse(present=present, absent=absent, leave=leave)

