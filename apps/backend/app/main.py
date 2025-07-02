# app/main.py

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.db.init import init_db
from app.core.logger import logger


# Import all routers
from app.routes.routes import router as api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("🔄 App starting up...")
    await init_db()
    logger.info("✅ DB initialized")
    yield
    logger.info("⛔ App shutting down...")
app = FastAPI(lifespan=lifespan)

# CORS Middleware (adjust origins in prod)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with specific domains in prod
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# # Register API routes
# app.include_router(auth.router, prefix="/api/v1/auth", tags=["Auth"])
# app.include_router(users.router, prefix="/api/v1/users", tags=["Users"])
# app.include_router(booking.router, prefix="/api/v1/booking", tags=["Booking"])
# app.include_router(subscription.router, prefix="/api/v1/subscription", tags=["Subscription"])
# app.include_router(feedback.router, prefix="/api/v1/feedback", tags=["Feedback"])
# app.include_router(admin.router, prefix="/api/v1/admin", tags=["Admin"])


app.include_router(api_router)
