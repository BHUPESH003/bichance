from fastapi import APIRouter

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("/me")
async def get_profile():
    return {"message": "User profile"}
