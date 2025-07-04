# app/db/init.py

from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.core.config import settings

# Import all models
from app.models.user import User
from app.models.booking import Booking
from app.models.group import DinnerGroup
from app.models.feedback import Feedback
from app.models.subscription import Subscription
from app.models.restaurant import Restaurant
from app.models.otp import OTP
from app.models.session import Session
from app.models.dinner import Dinner, DinnerGroup

async def init_db():
    client = AsyncIOMotorClient(settings.MONGO_URI)
    db = client[settings.DATABASE_NAME]

    await init_beanie(
        database=db,
        document_models=[
            User,
            Booking,
            DinnerGroup,
            Feedback,
            Subscription,
            Restaurant,
            OTP,
            Session,
            Dinner,
            DinnerGroup,
        ]
    )
