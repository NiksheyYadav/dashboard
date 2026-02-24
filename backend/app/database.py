import socket
import struct
import uuid
from datetime import datetime
from urllib.parse import urlparse

import psycopg2
from sqlalchemy import Boolean, DateTime, create_engine, func, event
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker

from app.config import settings

# ---------------------------------------------------------------------------
# DNS workaround: the local DNS server cannot resolve neon.tech hostnames.
# We resolve via Google DNS (8.8.8.8) and connect using the raw IP,
# passing the original hostname via SSL SNI so Neon routes correctly.
# ---------------------------------------------------------------------------

def _resolve_via_google_dns(hostname: str, dns_server: str = "8.8.8.8") -> str | None:
    """Resolve a hostname using a direct UDP DNS query to Google DNS."""
    try:
        # Try system resolver first
        return socket.gethostbyname(hostname)
    except socket.gaierror:
        pass

    try:
        tx_id = b"\xaa\xbb"
        flags_field = b"\x01\x00"
        counts = b"\x00\x01\x00\x00\x00\x00\x00\x00"
        qname = b""
        for part in hostname.encode().split(b"."):
            qname += bytes([len(part)]) + part
        qname += b"\x00"
        query = tx_id + flags_field + counts + qname + b"\x00\x01\x00\x01"

        sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        sock.settimeout(5)
        try:
            sock.sendto(query, (dns_server, 53))
            data, _ = sock.recvfrom(1024)
        finally:
            sock.close()

        # Skip header + question section
        idx = 12
        while data[idx] != 0:
            idx += data[idx] + 1
        idx += 5

        an_count = struct.unpack("!H", data[6:8])[0]
        for _ in range(an_count):
            if data[idx] & 0xC0 == 0xC0:
                idx += 2
            else:
                while data[idx] != 0:
                    idx += data[idx] + 1
                idx += 1
            rtype = struct.unpack("!H", data[idx:idx + 2])[0]
            rdlength = struct.unpack("!H", data[idx + 8:idx + 10])[0]
            idx += 10
            if rtype == 1 and rdlength == 4:
                return ".".join(str(b) for b in data[idx:idx + 4])
            idx += rdlength
    except Exception:
        pass
    return None


def _build_engine(database_url: str):
    """Build a SQLAlchemy engine, applying DNS workaround for Neon if needed."""
    parsed = urlparse(database_url)
    hostname = parsed.hostname

    # Check if system DNS can resolve the hostname
    needs_workaround = False
    resolved_ip = None
    if hostname and "neon.tech" in hostname:
        try:
            socket.gethostbyname(hostname)
        except socket.gaierror:
            resolved_ip = _resolve_via_google_dns(hostname)
            if resolved_ip:
                needs_workaround = True

    if needs_workaround and resolved_ip:
        # Replace hostname with IP in the URL for psycopg2
        ip_url = database_url.replace(hostname, resolved_ip)

        # Extract Neon endpoint ID from hostname (e.g. "ep-tiny-forest-aiz03dj5" from
        # "ep-tiny-forest-aiz03dj5-pooler.c-4.us-east-1.aws.neon.tech")
        endpoint_id = hostname.split("-pooler")[0] if "-pooler" in hostname else hostname.split(".")[0]

        def creator():
            conn = psycopg2.connect(
                host=resolved_ip,
                port=parsed.port or 5432,
                dbname=parsed.path.lstrip("/").split("?")[0],
                user=parsed.username,
                password=parsed.password,
                sslmode="require",
                options=f"endpoint={endpoint_id}",
            )
            return conn

        return create_engine(
            "postgresql+psycopg2://",
            creator=creator,
            future=True,
            pool_pre_ping=True,
        )
    else:
        return create_engine(database_url, future=True, pool_pre_ping=True)


class Base(DeclarativeBase):
    pass


class TimestampMixin:
    """Common timestamp fields for all tables."""

    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )


class SoftDeleteMixin:
    """Soft delete support for entities that should not be physically removed."""

    is_deleted: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)


class UUIDPrimaryKeyMixin:
    """UUID primary key mixin."""

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)


engine = _build_engine(settings.database_url)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
