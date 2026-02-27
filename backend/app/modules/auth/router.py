from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.db.session import get_db
from app.modules.auth.dependencies import AuthContext, get_auth_context, get_current_user
from app.modules.auth.schemas import LoginRequest, MeResponse, RegisterRequest, RegisterResponse, TokenResponse
from app.modules.auth.service import AuthService
from app.models.user import User

settings = get_settings()

ACCESS_COOKIE_NAME = "access_token"
REFRESH_COOKIE_NAME = "refresh_token"
REFRESH_COOKIE_PATH = f"{settings.api_v1_prefix}/auth/refresh"


auth_router = APIRouter(prefix="/auth", tags=["auth"])
protected_router = APIRouter(tags=["protected"])


def _set_auth_cookies(response: Response, *, access_token: str, refresh_token: str) -> None:
    access_max_age = settings.access_token_ttl_minutes * 60
    refresh_max_age = settings.refresh_token_ttl_days * 24 * 60 * 60

    response.set_cookie(
        key=ACCESS_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=access_max_age,
        path="/",
    )
    response.set_cookie(
        key=REFRESH_COOKIE_NAME,
        value=refresh_token,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
        max_age=refresh_max_age,
        path=REFRESH_COOKIE_PATH,
    )


def _clear_auth_cookies(response: Response) -> None:
    response.delete_cookie(
        key=ACCESS_COOKIE_NAME,
        path="/",
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )
    response.delete_cookie(
        key=REFRESH_COOKIE_NAME,
        path=REFRESH_COOKIE_PATH,
        httponly=True,
        secure=settings.cookie_secure,
        samesite=settings.cookie_samesite,
    )


@auth_router.post("/register", response_model=RegisterResponse, status_code=201)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> RegisterResponse:
    user = AuthService.register_user(db, email=payload.email, password=payload.password)
    return RegisterResponse(id=str(user.id), email=user.email, status=user.status)


@auth_router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, request: Request, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    access_token, refresh_token, _ = AuthService.login_user(
        db,
        email=payload.email,
        password=payload.password,
        ip=ip,
        user_agent=user_agent,
    )

    _set_auth_cookies(response, access_token=access_token, refresh_token=refresh_token)
    return TokenResponse(access_token=access_token)


@auth_router.post("/refresh", response_model=TokenResponse)
def refresh(request: Request, response: Response, db: Session = Depends(get_db)) -> TokenResponse:
    refresh_token_raw = request.cookies.get(REFRESH_COOKIE_NAME)
    if not refresh_token_raw:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")

    ip = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")

    access_token, new_refresh_token = AuthService.refresh_tokens(
        db,
        refresh_token_raw=refresh_token_raw,
        ip=ip,
        user_agent=user_agent,
    )

    _set_auth_cookies(response, access_token=access_token, refresh_token=new_refresh_token)
    return TokenResponse(access_token=access_token)


@auth_router.post("/logout")
def logout(
    response: Response,
    all_devices: bool = False,
    auth: AuthContext = Depends(get_auth_context),
    db: Session = Depends(get_db),
) -> dict[str, str]:
    AuthService.logout(db, user_id=auth.user.id, session_id=auth.session.id, all_devices=all_devices)
    _clear_auth_cookies(response)
    return {"detail": "Logged out"}


@auth_router.get("/me", response_model=MeResponse)
def me(user: User = Depends(get_current_user)) -> MeResponse:
    return MeResponse(id=str(user.id), email=user.email, status=user.status)


@protected_router.get("/protected")
def protected(auth: AuthContext = Depends(get_auth_context)) -> dict[str, str]:
    return {"message": "Protected route success", "user_id": str(auth.user.id), "session_id": str(auth.session.id)}


from app.modules.auth.schemas import ForgotPasswordRequest, ResetPasswordRequest


@auth_router.post("/forgot-password")
def forgot_password(payload: ForgotPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    AuthService.request_password_reset(db, email=payload.email)
    return {"detail": "If your email is registered, you will receive a password reset link shortly."}


@auth_router.post("/reset-password")
def reset_password(payload: ResetPasswordRequest, db: Session = Depends(get_db)) -> dict[str, str]:
    AuthService.reset_password(db, token=payload.token, new_password=payload.new_password)
    return {"detail": "Password has been successfully reset."}
