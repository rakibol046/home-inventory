from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.models.item_image import ItemImage


class ImageRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_for_item(self, item_id: UUID, user_id: UUID) -> list[ItemImage]:
        stmt = select(ItemImage).where(
            ItemImage.item_id == item_id,
            ItemImage.user_id == user_id,
            ItemImage.deleted_at.is_(None),
        ).order_by(ItemImage.display_order)
        result = await self.db.execute(stmt)
        return list(result.scalars().all())

    async def create(self, data: dict) -> ItemImage:
        img = ItemImage(**data)
        self.db.add(img)
        await self.db.commit()
        await self.db.refresh(img)
        return img

    async def get_by_id(self, image_id: UUID, user_id: UUID) -> ItemImage | None:
        result = await self.db.execute(
            select(ItemImage).where(ItemImage.id == image_id, ItemImage.user_id == user_id, ItemImage.deleted_at.is_(None))
        )
        return result.scalar_one_or_none()

    async def soft_delete(self, image_id: UUID, user_id: UUID) -> bool:
        stmt = (
            update(ItemImage)
            .where(ItemImage.id == image_id, ItemImage.user_id == user_id)
            .values(deleted_at=datetime.now(timezone.utc))
        )
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount > 0
