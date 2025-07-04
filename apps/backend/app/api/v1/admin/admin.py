from fastapi import APIRouter, HTTPException
from app.models.dinner import  Dinner
from app.schemas.dinner import CreateDinnerRequest, DinnerResponse, CreateDinnerResponse
from typing import List
from app.schemas.response import SuccessResponse

router = APIRouter(prefix="/admin", tags=["Admin"])

# Create a dinner (city + date + time level)
@router.post("/dinner/create", response_model=SuccessResponse[CreateDinnerResponse])
async def create_dinner(payload: CreateDinnerRequest):
    exisiting_dinner = await Dinner.find_one(
        Dinner.date == payload.date,
        Dinner.city == payload.city,
    )
    if exisiting_dinner:
        raise HTTPException(status_code=400, detail="Dinner already exists")
    dinner = Dinner(
        date=payload.date,
        city=payload.city,
        country=payload.country,
        opted_in_user_ids=[]
    )
    Dinner.country == payload.country
    await dinner.insert()
    return SuccessResponse(message="Dinner created successfully", data={
        "id": str(dinner.id)
    })


@router.get("/dinner/all", response_model=SuccessResponse[List[Dinner]])
async def list_all_dinners():
  dinners= await Dinner.find_all().to_list()
  return SuccessResponse(message="Dinners fetched successfully", data=dinners)


@router.get("/dinner/{dinner_id}", response_model=Dinner)
async def get_dinner(dinner_id: str):
    dinner = await Dinner.get(dinner_id)
    if not dinner:
        raise HTTPException(status_code=404, detail="Dinner not found")
    return dinner


@router.patch("/dinner/{dinner_id}/update")
async def update_dinner(dinner_id: str, payload: dict):
    dinner = await Dinner.get(dinner_id)
    if not dinner:
        raise HTTPException(status_code=404, detail="Dinner not found")

    for key, value in payload.items():
        if hasattr(dinner, key):
            setattr(dinner, key, value)

    await dinner.save()
    return {"message": "Dinner updated successfully"}

