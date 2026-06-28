from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User

router = APIRouter(tags=["reports"])


@router.get("/reports/summary")
async def get_summary(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.dashboard_service import DashboardService
    stats = await DashboardService(db).get_stats(current_user.id)
    return {
        "total_items": stats.total_items,
        "total_value": stats.total_value,
        "active_warranties": stats.active_warranties,
        "expiring_warranties_30d": stats.expiring_warranties_30d,
        "items_by_category": stats.items_by_category,
        "items_by_location": stats.items_by_location,
    }
