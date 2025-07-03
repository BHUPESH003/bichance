from fastapi import APIRouter, HTTPException
from app.schemas.auth import OTPRequest, OTPVerifyRequest, TokenResponse
from app.utils.otp import generate_otp, save_otp, verify_otp
from app.services.email import send_otp_email
from app.utils.jwt import create_access_token
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Auth"])
@router.post("/send-otp")
async def send_otp(payload: OTPRequest):
    otp = generate_otp()
    await save_otp(payload.email, otp)
    send_otp_email(payload.email, otp)
    return {"message": "OTP sent"}

@router.post("/verify-otp", response_model=TokenResponse)
async def verify_user_otp(payload: OTPVerifyRequest):
    if not await verify_otp(payload.email, payload.otp):
        raise HTTPException(status_code=401, detail="Invalid or expired OTP")

    # Check if user already exists
    user = await User.find_one(User.email == payload.email)

    if not user:
        user = User(
        email=payload.email,
        name="",
        mobile="",
        city="",
        country="",
        dob=None,
        gender="",
        relationship_status="",
        children=False,
        profession="",
        personality_answers=[],
        personality_scores={},
        identity_verified=False,
        subscription_status="none",
        image_url=None
    )
        await user.insert()

    # Create JWT using user ID or email
    access_token = create_access_token(data={"sub": str(user.id)})
    return {"access_token": access_token}
