from fastapi import APIRouter

# Import each modular router
from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.booking import router as booking_router
from app.api.v1.subscription import router as subscription_router
from app.api.v1.feedback import router as feedback_router
from app.api.v1.admin import router as admin_router

# Create a base API router for version v1
router = APIRouter(prefix="/api/v1")

# Include all modular routers
router.include_router(auth_router)
router.include_router(users_router)
router.include_router(booking_router)
router.include_router(subscription_router)
router.include_router(feedback_router)
router.include_router(admin_router)

