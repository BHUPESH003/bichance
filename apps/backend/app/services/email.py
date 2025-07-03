import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from app.core.config import settings
from app.core.logger import logger  # If using your logger setup

def send_otp_email(to_email: str, otp: str):
    try:
        # Create message container
        message = MIMEMultipart()
        message["Subject"] = "Your DinnerConnect OTP Code"
        message["From"] = settings.EMAIL_SENDER
        message["To"] = to_email

        # Email content
        body = f"""
        Hello,

        Your OTP for DinnerConnect is: {otp}

        This OTP is valid for 5 minutes.

        If you did not request this, please ignore this email.

        Regards,
        DinnerConnect Team
        """
        message.attach(MIMEText(body, "plain"))

        # Connect to Gmail SMTP server
        with smtplib.SMTP(settings.SMTP_SERVER, int(settings.SMTP_PORT)) as server:
            server.starttls()
            server.login(settings.EMAIL_SENDER, settings.EMAIL_PASSWORD)
            server.send_message(message)

        logger.info(f"✅ OTP email sent to {to_email}")

    except Exception as e:
        logger.error(f"❌ Failed to send OTP email to {to_email}: {e}")
        raise
