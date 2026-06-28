from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.notification import NotificationRead
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["notifications"])


@router.get("/notifications")
async def list_notifications(
    unread_only: bool = Query(default=False),
    params: PaginationParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.notification_repository import NotificationRepository
    items, total = await NotificationRepository(db).list(
        current_user.id, unread_only=unread_only, offset=params.offset, limit=params.page_size
    )
    return PaginatedResponse.create([NotificationRead.model_validate(n) for n in items], total, params)


@router.patch("/notifications/{notification_id}/read")
async def mark_read(
    notification_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.notification_repository import NotificationRepository
    ok = await NotificationRepository(db).mark_read(notification_id, current_user.id)
    if not ok:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}


@router.post("/notifications/read-all")
async def mark_all_read(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.notification_repository import NotificationRepository
    await NotificationRepository(db).mark_all_read(current_user.id)
    return {"message": "All notifications marked as read"}
