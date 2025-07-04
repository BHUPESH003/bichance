from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class CreateDinnerRequest(BaseModel):
    date: datetime
    city: str
    country: str
    
class CreateDinnerResponse(BaseModel):
    id: str

class DinnerResponse(BaseModel):
    id: str
    date: datetime
    city: str
    country: str
    budget: Optional[str]
    dietary_restrictions: Optional[List[str]]
    opted_in_user_ids: Optional[List[str]]
    participant_ids: Optional[List[str]]
    venue: Optional[str]
