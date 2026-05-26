import logging
import smtplib
from email.message import EmailMessage

from app.core.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()


def send_password_reset_email(to_email: str, reset_token: str) -> None:
    """Send a password reset email to the user."""
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.warning(f"SMTP configuration is missing. Would have sent reset email to {to_email} with token {reset_token}")
        return

    reset_url = f"{settings.frontend_url}/reset-password?token={reset_token}"
    
    msg = EmailMessage()
    msg["Subject"] = "Password Reset Request"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email

    content = f"""
    Hello,
    
    You have requested to reset your password. Please click the link below to reset it:
    {reset_url}
    
    If you did not request this, please ignore this email.
    
    This link will expire in 15 minutes.
    """
    msg.set_content(content)

    html_content = f"""
    <html>
      <body>
        <p>Hello,</p>
        <p>You have requested to reset your password. Please click the link below to reset it:</p>
        <p><a href="{reset_url}">{reset_url}</a></p>
        <p>If you did not request this, please ignore this email.</p>
        <p>This link will expire in 15 minutes.</p>
      </body>
    </html>
    """
    msg.add_alternative(html_content, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            logger.info(f"Password reset email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send password reset email to {to_email}: {e}")
        # We don't raise an exception here because we don't want to stop the flow
        # In a real app, we might want to queue the email and retry


def send_welcome_email(to_email: str, raw_password: str, role: str) -> None:
    """Send a welcome email with initial login credentials."""
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        logger.warning(f"SMTP config missing. Would have sent welcome email to {to_email}. Password: {raw_password}")
        return

    login_url = f"{settings.frontend_url}/login"
    
    msg = EmailMessage()
    msg["Subject"] = "Welcome to EduPulse - Your Login Credentials"
    msg["From"] = settings.smtp_from
    msg["To"] = to_email

    content = f"""
    Welcome to EduPulse!
    
    An account has been created for you as a {role.capitalize()}.
    
    Your login credentials are:
    Email: {to_email}
    Password: {raw_password}
    
    Please log in here: {login_url}
    
    We highly recommend you change your password after your first login.
    """
    msg.set_content(content)

    html_content = f"""
    <html>
      <body>
        <h2>Welcome to EduPulse!</h2>
        <p>An account has been created for you as a <strong>{role.capitalize()}</strong>.</p>
        <p>Your login credentials are:</p>
        <ul>
            <li><strong>Email:</strong> {to_email}</li>
            <li><strong>Password:</strong> {raw_password}</li>
        </ul>
        <p>Please log in here: <a href="{login_url}">{login_url}</a></p>
        <p><em>We highly recommend you change your password after your first login.</em></p>
      </body>
    </html>
    """
    msg.add_alternative(html_content, subtype="html")

    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
            server.starttls()
            server.login(settings.smtp_user, settings.smtp_password)
            server.send_message(msg)
            logger.info(f"Welcome email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send welcome email to {to_email}: {e}")
