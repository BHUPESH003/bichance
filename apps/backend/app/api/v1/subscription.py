
# app/api/v1/subscription.py
from fastapi import APIRouter, Depends, Request, HTTPException
from fastapi.responses import JSONResponse
from stripe import stripe, error as stripe_error
from app.models.subscription import Subscription
from app.models.user import User
from app.dependencies.auth import get_current_user
from app.services.email import send_subscription_email
from app.core.config import settings
from datetime import datetime, timezone
from pydantic import BaseModel
from app.core.notifications.producer import queue_notification
from beanie import PydanticObjectId
router = APIRouter(prefix="/subscription", tags=["Subscription"])

stripe.api_key = settings.STRIPE_SECRET_KEY
class CheckoutSessionRequest(BaseModel):
    price_id: str  # from frontend


@router.post("/create-checkout-session", dependencies=[Depends(get_current_user)])
def create_checkout_session(
    data: CheckoutSessionRequest,
    user: User = Depends(get_current_user)
):
    try:
        checkout_session = stripe.checkout.Session.create(
            
            payment_method_types=["card"],
            billing_address_collection="required",  # ✅ This collects address on the checkout page
            mode="subscription",
            line_items=[{
                "price": data.price_id,
                "quantity": 1
            }],
            customer_email=user.email,  # Pre-fill email on checkout page
            metadata={
                "user_id": str(user.id),
                "email": user.email
            },
            success_url=f"{settings.FRONTEND_URL}/subscription/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{settings.FRONTEND_URL}/subscription/cancel",
        )
        return {"session_url": checkout_session.url}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
    
@router.post("/cancel", dependencies=[Depends(get_current_user)])
async def cancel_subscription(user: User = Depends(get_current_user)):
    subscription = await Subscription.find_one(Subscription.user_email == user.email, Subscription.status == "active")
    if not subscription:
        raise HTTPException(status_code=404, detail="No active subscription found")

    stripe.Subscription.delete(subscription.stripe_subscription_id)
    subscription.status = "cancelled"
    subscription.end_date = datetime.now(timezone.utc)
    await subscription.save()
    return {"message": "Subscription cancelled"}


@router.post("/webhook")
async def stripe_webhook(request: Request):
    # You can add signature verification and event handling here
    payload = await request.body()
    # For now, just log and return success
    print("Received Stripe webhook:", payload)
    return JSONResponse(content={"status": "success"})

@router.get("/session-info")
async def get_session_info(session_id: str, user: User = Depends(get_current_user)):
    try:
        session = stripe.checkout.Session.retrieve(session_id, expand=["subscription"])
        subscription = session.get("subscription")

        return {
            "subscription": {
                "id": subscription["id"],
                "status": subscription["status"],
                "current_period_end": subscription["current_period_end"],
            }
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
