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
    """Ensure all database tables exist and seed demo users on startup."""
    from app.db.base import Base
    from app.db.session import engine, SessionLocal
    import app.models  # noqa: F401
    
    # 1. Create all tables
    try:
        # This will create all tables defined in models that don't exist yet
        Base.metadata.create_all(bind=engine)
        
        # Ensure 'department' column exists in 'users' table (for existing tables)
        from sqlalchemy import text
        with engine.connect() as conn:
            # Check if department column exists
            result = conn.execute(text("SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='department'"))
            if not result.fetchone():
                logger.info("Adding 'department' column to 'users' table")
                conn.execute(text("ALTER TABLE users ADD COLUMN department VARCHAR(100)"))
                conn.commit()
                
        logger.info("Database tables initialized successfully")
    except Exception:
        logger.exception("Could not initialize database tables")
        
    # 2. Seed demo users
    from app.modules.auth.service import AuthService
    from fastapi import HTTPException
    
    demo_users = [
        {"email": "admin@sgtuniversity.edu", "password": "DemoPass123!", "department": "Administration"},
        {"email": "dean@sgtuniversity.edu", "password": "DemoPass123!", "department": "All"},
        {"email": "hod@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech CS"},
        {"email": "hod_it@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech IT"},
        {"email": "coordinator@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech CS"},
        {"email": "faculty@sgtuniversity.edu", "password": "DemoPass123!", "department": "B.Tech CS"},
    ]
    
    db = SessionLocal()
    try:
        for user_data in demo_users:
            try:
                AuthService.register_user(
                    db, 
                    email=user_data["email"], 
                    password=user_data["password"],
                    department=user_data["department"]
                )
                logger.info(f"Seed: Created user {user_data['email']}")
            except HTTPException as exc:
                if exc.status_code == 409:
                    # User already exists
                    continue
                logger.error(f"Seed: Failed to create user {user_data['email']}: {exc.detail}")
            except Exception:
                logger.exception(f"Seed: Unexpected error creating user {user_data['email']}")
        db.commit()
    finally:
        db.close()
