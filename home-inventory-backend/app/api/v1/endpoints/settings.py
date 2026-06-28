from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.settings import SettingsRead, SettingsUpdate

router = APIRouter(tags=["settings"])


@router.get("/settings", response_model=SettingsRead)
async def get_settings(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.settings_repository import SettingsRepository
    s = await SettingsRepository(db).get_by_user(current_user.id)
    if not s:
        s = await SettingsRepository(db).create(current_user.id)
    return s


@router.patch("/settings", response_model=SettingsRead)
async def update_settings(
    data: SettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.settings_repository import SettingsRepository
    repo = SettingsRepository(db)
    s = await repo.get_by_user(current_user.id)
    if not s:
        s = await repo.create(current_user.id)
    return await repo.update(s, data.model_dump(exclude_none=True))
