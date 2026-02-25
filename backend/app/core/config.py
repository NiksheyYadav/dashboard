from functools import lru_cache
from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

from app.core.enums import AppEnvironment


def _split_origins(value: str) -> list[str]:
    return [item.strip() for item in value.split(",") if item.strip()]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_name: str = Field(default="Dashboard Backend", alias="APP_NAME")
    app_env: AppEnvironment = Field(default=AppEnvironment.DEVELOPMENT, alias="APP_ENV")
    debug: bool = Field(default=True, alias="DEBUG")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")

    database_url: str = Field(..., alias="DATABASE_URL")

    jwt_access_secret: str = Field(..., alias="JWT_ACCESS_SECRET")
    jwt_refresh_secret: str = Field(..., alias="JWT_REFRESH_SECRET")
    password_pepper: str = Field(..., alias="PASSWORD_PEPPER")
    access_token_ttl_minutes: int = Field(default=15, alias="ACCESS_TOKEN_TTL_MINUTES")
    refresh_token_ttl_days: int = Field(default=7, alias="REFRESH_TOKEN_TTL_DAYS")
    jwt_issuer: str = Field(default="attendance-backend", alias="JWT_ISSUER")
    auth_lock_minutes: int = Field(default=15, alias="AUTH_LOCK_MINUTES")
    auth_max_failed_attempts: int = Field(default=5, alias="AUTH_MAX_FAILED_ATTEMPTS")

    cookie_secure: bool = Field(default=False, alias="COOKIE_SECURE")
    cookie_samesite: str = Field(default="lax", alias="COOKIE_SAMESITE")
    cors_origins_raw: str = Field(
        default="http://localhost:3000,http://127.0.0.1:3000",
        alias="CORS_ORIGINS",
    )

    log_level: str = Field(default="INFO", alias="LOG_LEVEL")
    request_id_header: str = Field(default="X-Request-ID", alias="REQUEST_ID_HEADER")

    @property
    def cors_origins(self) -> list[str]:
        return _split_origins(self.cors_origins_raw)


@lru_cache
def get_settings() -> Settings:
    return Settings()
