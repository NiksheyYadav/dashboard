from __future__ import annotations

import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import analytics, announcements, attendance, auth, courses, cv, dashboard, enrollments, fees, forms, reports, students
from app.services import audit_service  # noqa: F401
from app.utils.request_context import set_request_context
from app.utils.security import decode_token

app = FastAPI(title=settings.app_name)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[origin.strip() for origin in settings.cors_origins.split(",")],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def inject_request_context(request: Request, call_next):
    """Extracts JWT claims and sets user/org context for audit logging."""

    user_id = None
    org_id = None

    auth_header = request.headers.get("Authorization")
    if auth_header and auth_header.startswith("Bearer "):
        payload = decode_token(auth_header.replace("Bearer ", "", 1))
        if payload:
            try:
                user_id = uuid.UUID(payload.get("sub")) if payload.get("sub") else None
                org_id = uuid.UUID(payload.get("org")) if payload.get("org") else None
            except ValueError:
                user_id = None
                org_id = None

    set_request_context(user_id=user_id, org_id=org_id)
    response = await call_next(request)
    return response


@app.get("/health")
def health_check():
    return {"status": "ok"}


app.include_router(auth.router, prefix=settings.api_v1_prefix)
app.include_router(students.router, prefix=settings.api_v1_prefix)
app.include_router(courses.router, prefix=settings.api_v1_prefix)
app.include_router(enrollments.router, prefix=settings.api_v1_prefix)
app.include_router(attendance.router, prefix=settings.api_v1_prefix)
app.include_router(cv.router, prefix=settings.api_v1_prefix)
app.include_router(dashboard.router, prefix=settings.api_v1_prefix)
app.include_router(announcements.router, prefix=settings.api_v1_prefix)
app.include_router(forms.router, prefix=settings.api_v1_prefix)
app.include_router(fees.router, prefix=settings.api_v1_prefix)
app.include_router(analytics.router, prefix=settings.api_v1_prefix)
app.include_router(reports.router, prefix=settings.api_v1_prefix)
