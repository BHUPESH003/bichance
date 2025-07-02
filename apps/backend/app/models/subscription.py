from beanie import Document
from typing import Literal
from datetime import date

class Subscription(Document):
    user_id: str
    plan: Literal["1", "3", "6"]  # months
    start_date: date
    end_date: date
    status: Literal["active", "expired", "cancelled"] = "active"

    class Settings:
        name = "subscriptions"
