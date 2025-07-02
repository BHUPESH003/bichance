from beanie import Document
from typing import Optional, Literal
from datetime import date

class Booking(Document):
    user_id: str
    dinner_date: date
    dietary_restrictions: Optional[str]
    group_type: Literal["single", "double", "triple"] = "single"
    status: Literal["booked", "cancelled", "rescheduled"] = "booked"

    class Settings:
        name = "bookings"
