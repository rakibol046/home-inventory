from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.settings import UserSettings


class SettingsRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_by_user(self, user_id: UUID) -> UserSettings | None:
        result = await self.db.execute(select(UserSettings).where(UserSettings.user_id == user_id))
        return result.scalar_one_or_none()

    async def create(self, user_id: UUID) -> UserSettings:
        s = UserSettings(user_id=user_id)
        self.db.add(s)
        await self.db.commit()
        await self.db.refresh(s)
        return s

    async def update(self, settings: UserSettings, data: dict) -> UserSettings:
        for k, v in data.items():
            if v is not None:
                setattr(settings, k, v)
        await self.db.commit()
        await self.db.refresh(settings)
        return settings
