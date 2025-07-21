import boto3
import json
from app.core.config import settings

sqs = boto3.client(
    "sqs",
    region_name=settings.AWS_REGION,
    aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
    aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
)

def queue_email_notification(to_email: str, template: str, data: dict):
    """
    Generic producer for all email notifications.
    """
    return sqs.send_message(
        QueueUrl=settings.SQS_QUEUE_URL,
        MessageBody=json.dumps({
            "email": to_email,
            "template": template,
            "data": data
        })
    )
