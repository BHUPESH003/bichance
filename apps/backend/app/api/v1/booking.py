from fastapi import APIRouter

router = APIRouter(prefix="/booking", tags=["Booking"])

@router.post("/")
async def book_dinner():
    return {"message": "Dinner booked"}

