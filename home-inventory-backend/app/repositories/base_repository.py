from typing import Any, Generic, TypeVar
from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.base import Base

ModelT = TypeVar("ModelT", bound=Base)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, db: AsyncSession):
        self.db = db

    def _active_query(self):
        """Base select filtered by soft-delete."""
        return select(self.model).where(self.model.deleted_at.is_(None))

    async def get_by_id(self, id: UUID, user_id: UUID) -> ModelT | None:
        stmt = self._active_query().where(
            self.model.id == id,
            self.model.user_id == user_id,
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def get_by_id_raw(self, id: UUID) -> ModelT | None:
        result = await self.db.execute(select(self.model).where(self.model.id == id))
        return result.scalar_one_or_none()

    async def list(self, user_id: UUID, offset: int = 0, limit: int = 20) -> list[ModelT]:
        stmt = self._active_query().where(self.model.user_id == user_id).offset(offset).limit(limit)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def count(self, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(self.model).where(
            self.model.user_id == user_id,
            self.model.deleted_at.is_(None),
        )
        result = await self.db.execute(stmt)
        return result.scalar_one()

    async def create(self, data: dict[str, Any]) -> ModelT:
        obj = self.model(**data)
        self.db.add(obj)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def update(self, id: UUID, user_id: UUID, data: dict[str, Any]) -> ModelT | None:
        obj = await self.get_by_id(id, user_id)
        if not obj:
            return None
        for k, v in data.items():
            setattr(obj, k, v)
        await self.db.commit()
        await self.db.refresh(obj)
        return obj

    async def soft_delete(self, id: UUID, user_id: UUID) -> bool:
        from datetime import datetime, timezone
        stmt = (
            update(self.model)
            .where(self.model.id == id, self.model.user_id == user_id, self.model.deleted_at.is_(None))
            .values(deleted_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0
