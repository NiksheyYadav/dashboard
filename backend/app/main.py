import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.core.config import get_settings
from app.core.logging import configure_logging
from app.middleware.request_id import RequestIdMiddleware
from app.modules.auth.router import auth_router, protected_router
from app.modules.insights.router import insights_router
from app.modules.messages.router import messages_router
from app.modules.students.router import students_router
from app.modules.users.router import users_router
from app.utils.exceptions import AppException

settings = get_settings()
configure_logging(settings.log_level)
logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.app_name,
    version="1.0.0",
    docs_url=f"{settings.api_v1_prefix}/docs" if settings.debug else None,
    redoc_url=f"{settings.api_v1_prefix}/redoc" if settings.debug else None,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)
app.add_middleware(RequestIdMiddleware, header_name=settings.request_id_header)
app.include_router(auth_router, prefix=settings.api_v1_prefix)
app.include_router(protected_router, prefix=settings.api_v1_prefix)
app.include_router(insights_router, prefix=settings.api_v1_prefix)
app.include_router(students_router, prefix=settings.api_v1_prefix)
app.include_router(messages_router, prefix=settings.api_v1_prefix)
app.include_router(users_router, prefix=settings.api_v1_prefix)


@app.exception_handler(AppException)
async def app_exception_handler(_: Request, exc: AppException) -> JSONResponse:
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.message})


@app.exception_handler(Exception)
async def unhandled_exception_handler(_: Request, exc: Exception) -> JSONResponse:
    logger.exception("Unhandled exception", exc_info=exc)
    return JSONResponse(status_code=500, content={"detail": "Internal Server Error"})


@app.get("/health", tags=["system"])
def health_check() -> dict[str, str]:
    return {"status": "ok"}


@app.on_event("startup")
async def create_tables() -> None:
    """Ensure anonymous_messages table exists on startup."""
    from sqlalchemy import text
    from app.db.session import SessionLocal
    try:
        db = SessionLocal()
        db.execute(text("""
            CREATE TABLE IF NOT EXISTS anonymous_messages (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                message TEXT NOT NULL,
                status VARCHAR(20) NOT NULL DEFAULT 'UNREAD',
                created_at TIMESTAMPTZ NOT NULL DEFAULT now()
            )
        """))
        db.commit()
        db.close()
        logger.info("anonymous_messages table ready")
    except Exception:
        logger.warning("Could not auto-create anonymous_messages table", exc_info=True)
