# dinner_routes_user.py
from fastapi import APIRouter, Depends, HTTPException
from typing import List
from datetime import date
from beanie import PydanticObjectId
from app.models.user import User
from app.models.dinner import DinnerGroup, Dinner, DinnerPublicResponse
from app.dependencies.auth import get_current_user
from app.schemas.response import SuccessResponse
from datetime import datetime, time, timezone, timedelta
from pydantic import BaseModel
class OptInResponse(BaseModel):
    dinner_id: PydanticObjectId
router = APIRouter(prefix="/dinner", tags=["Dinner - User"])

@router.get("/upcoming", response_model=SuccessResponse[List[DinnerPublicResponse]])
async def get_upcoming_dinners(user: User = Depends(get_current_user)):
    today_utc = datetime.combine(date.today(), time.min).replace(tzinfo=timezone.utc)
    cutoff_datetime = datetime.now(timezone.utc) + timedelta(hours=48)

    upcoming_dinners = await Dinner.find(
        Dinner.city == user.current_city,
        Dinner.country == user.current_country,
        Dinner.date >= cutoff_datetime
    ).sort("date").limit(3).to_list()

    print("UTC Today:", today_utc)

    return SuccessResponse(message="Upcoming dinners fetched", data=upcoming_dinners)

@router.post("/opt-in", response_model=SuccessResponse[OptInResponse])

async def opt_in_to_dinner(dinner_id: PydanticObjectId, user: User = Depends(get_current_user)):
    dinner = await Dinner.get(dinner_id)
    if not dinner:
        raise HTTPException(status_code=404, detail="Dinner not found")

    if user.id in dinner.opted_in_user_ids:
        raise HTTPException(status_code=400, detail="Already opted in")

    dinner.opted_in_user_ids.append(user.id)
    await dinner.save()
    return SuccessResponse(message="Opt-ed in successfully", data=OptInResponse(dinner_id=dinner_id))



@router.get("/my-bookings", response_model=SuccessResponse[List[DinnerGroup]])
async def get_user_bookings(user: User = Depends(get_current_user)) -> List[DinnerGroup]:
    dinners= await DinnerGroup.find(DinnerGroup.participant_ids == user.id).sort("date").to_list()
    return SuccessResponse(message="Opt-ed in successfully", data={"dinners": dinners})
