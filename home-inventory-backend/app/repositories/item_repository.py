from uuid import UUID

from sqlalchemy import delete, func, or_, select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.inventory_item import InventoryItem
from app.models.item_image import ItemImage
from app.models.item_label import ItemLabel
from app.models.label import Label
from app.models.location import Location
from app.models.room import Room
from app.repositories.base_repository import BaseRepository


class ItemRepository(BaseRepository[InventoryItem]):
    model = InventoryItem

    async def list_paginated(
        self,
        user_id: UUID,
        offset: int,
        limit: int,
        search: str | None = None,
        location_id: UUID | None = None,
        category_id: UUID | None = None,
        label_id: UUID | None = None,
        sort_by: str = "updated_at",
    ) -> tuple[list[InventoryItem], int]:
        base = (
            select(InventoryItem)
            .options(
                selectinload(InventoryItem.item_labels).selectinload(ItemLabel.label),
                selectinload(InventoryItem.images),
            )
            .where(InventoryItem.user_id == user_id, InventoryItem.deleted_at.is_(None))
        )
        if search:
            pattern = f"%{search}%"
            base = base.where(
                or_(
                    InventoryItem.name.ilike(pattern),
                    InventoryItem.brand.ilike(pattern),
                    InventoryItem.model_number.ilike(pattern),
                )
            )
        if location_id:
            base = base.where(InventoryItem.location_id == location_id)
        if category_id:
            base = base.where(InventoryItem.category_id == category_id)
        if label_id:
            base = base.join(ItemLabel, ItemLabel.item_id == InventoryItem.id).where(ItemLabel.label_id == label_id)

        sort_col = getattr(InventoryItem, sort_by, InventoryItem.updated_at)
        count_stmt = select(func.count()).select_from(base.subquery())
        total = (await self.db.execute(count_stmt)).scalar_one()
        items_stmt = base.order_by(sort_col.desc()).offset(offset).limit(limit)
        items = list((await self.db.execute(items_stmt)).scalars().unique().all())
        return items, total

    async def get_detail(self, item_id: UUID, user_id: UUID) -> InventoryItem | None:
        stmt = (
            select(InventoryItem)
            .options(
                selectinload(InventoryItem.item_labels).selectinload(ItemLabel.label),
                selectinload(InventoryItem.images),
                selectinload(InventoryItem.warranty),
                selectinload(InventoryItem.purchase_record),
                selectinload(InventoryItem.location).selectinload(Location.room),
            )
            .where(InventoryItem.id == item_id, InventoryItem.user_id == user_id, InventoryItem.deleted_at.is_(None))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()

    async def attach_label(self, item_id: UUID, label_id: UUID) -> None:
        existing = await self.db.execute(
            select(ItemLabel).where(ItemLabel.item_id == item_id, ItemLabel.label_id == label_id)
        )
        if not existing.scalar_one_or_none():
            self.db.add(ItemLabel(item_id=item_id, label_id=label_id))
            await self.db.commit()

    async def detach_label(self, item_id: UUID, label_id: UUID) -> None:
        await self.db.execute(
            delete(ItemLabel).where(ItemLabel.item_id == item_id, ItemLabel.label_id == label_id)
        )
        await self.db.commit()

    async def replace_labels(self, item_id: UUID, label_ids: list[UUID]) -> None:
        await self.db.execute(delete(ItemLabel).where(ItemLabel.item_id == item_id))
        for lid in label_ids:
            self.db.add(ItemLabel(item_id=item_id, label_id=lid))
        await self.db.commit()
