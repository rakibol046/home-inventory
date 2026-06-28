from fastapi import APIRouter

from app.api.v1.endpoints import (
    auth,
    categories,
    dashboard,
    items,
    labels,
    locations,
    notifications,
    reports,
    settings,
    users,
)

api_router = APIRouter(prefix="/v1")

api_router.include_router(users.router)
api_router.include_router(auth.router)
api_router.include_router(items.router)
api_router.include_router(locations.router)
api_router.include_router(categories.router)
api_router.include_router(labels.router)
api_router.include_router(dashboard.router)
api_router.include_router(notifications.router)
api_router.include_router(settings.router)
api_router.include_router(reports.router)
