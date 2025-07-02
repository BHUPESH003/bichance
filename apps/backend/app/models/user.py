from beanie import Document
from pydantic import EmailStr
from typing import Optional, Dict, List
from datetime import date

class User(Document):
    email: EmailStr
    name: Optional[str]
    mobile: Optional[str]
    city: Optional[str]
    country: Optional[str]
    dob: Optional[date]
    gender: Optional[str]
    relationship_status: Optional[str]
    children: Optional[bool]
    profession: Optional[str]
    
    # New fields
    personality_answers: Optional[List[str]]  # store 21 answers as string keys
    personality_scores: Optional[Dict[str, float]]  # O, C, E, A, N

    identity_verified: bool = False
    subscription_status: str = "none"

    image_url: Optional[str]  # link to S3 or any image CDN

    class Settings:
        name = "users"
