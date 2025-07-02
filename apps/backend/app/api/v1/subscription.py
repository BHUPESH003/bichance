from fastapi import APIRouter

router = APIRouter(prefix="/subscription", tags=["Subscription"])

@router.post("/start")
async def start_subscription():
    return {"message": "Subscription started"}
