from uuid import UUID

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.models.notification import Notification


class NotificationRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list(self, user_id: UUID, unread_only: bool = False, offset: int = 0, limit: int = 20) -> tuple[list[Notification], int]:
        base = select(Notification).where(Notification.user_id == user_id, Notification.deleted_at.is_(None))
        if unread_only:
            base = base.where(Notification.is_read.is_(False))
        count = (await self.db.execute(select(func.count()).select_from(base.subquery()))).scalar_one()
        items = list((await self.db.execute(base.order_by(Notification.created_at.desc()).offset(offset).limit(limit))).scalars().all())
        return items, count

    async def mark_read(self, notification_id: UUID, user_id: UUID) -> bool:
        stmt = (
            update(Notification)
            .where(Notification.id == notification_id, Notification.user_id == user_id)
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0

    async def mark_all_read(self, user_id: UUID) -> None:
        stmt = (
            update(Notification)
            .where(Notification.user_id == user_id, Notification.is_read.is_(False))
            .values(is_read=True, read_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def create(self, data: dict) -> Notification:
        n = Notification(**data)
        self.db.add(n)
        await self.db.commit()
        await self.db.refresh(n)
        return n

    async def unread_count(self, user_id: UUID) -> int:
        stmt = select(func.count()).select_from(Notification).where(
            Notification.user_id == user_id,
            Notification.is_read.is_(False),
            Notification.deleted_at.is_(None),
        )
        return (await self.db.execute(stmt)).scalar_one()
