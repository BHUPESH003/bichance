from fastapi import Depends, HTTPException
from datetime import datetime, timezone
from app.models.subscription import Subscription
from app.models.user import User
from app.dependencies.auth import get_current_user

async def require_active_subscription(user: User = Depends(get_current_user)):
    subscription = await Subscription.find_one(Subscription.user_email == user.email)

    if not subscription:
        raise HTTPException(status_code=403, detail="No active subscription found.")

    now = datetime.now(timezone.utc)
    if subscription.status != "active" or (subscription.end_date and subscription.end_date < now):
        raise HTTPException(status_code=403, detail="Subscription expired.")

    return user  # Pass user forward if needed
