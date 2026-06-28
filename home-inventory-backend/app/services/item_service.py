from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.repositories.item_repository import ItemRepository
from app.repositories.location_repository import LocationRepository
from app.repositories.category_repository import CategoryRepository
from app.repositories.label_repository import LabelRepository
from app.repositories.purchase_repository import PurchaseRepository
from app.repositories.warranty_repository import WarrantyRepository
from app.schemas.item import ItemCreate, ItemDetailRead, ItemRead, ItemUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams


class ItemService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.repo = ItemRepository(db)
        self.loc_repo = LocationRepository(db)
        self.cat_repo = CategoryRepository(db)
        self.label_repo = LabelRepository(db)
        self.purchase_repo = PurchaseRepository(db)

    async def list_items(
        self,
        user_id: UUID,
        params: PaginationParams,
        search: str | None = None,
        location_id: UUID | None = None,
        category_id: UUID | None = None,
        label_id: UUID | None = None,
        sort_by: str = "updated_at",
    ) -> PaginatedResponse[ItemRead]:
        items, total = await self.repo.list_paginated(
            user_id=user_id,
            offset=params.offset,
            limit=params.page_size,
            search=search,
            location_id=location_id,
            category_id=category_id,
            label_id=label_id,
            sort_by=sort_by,
        )
        reads = []
        for item in items:
            r = ItemRead.model_validate(item)
            r.labels = [il.label for il in item.item_labels if il.label and il.label.deleted_at is None]
            primary = next((img for img in item.images if img.is_primary and not img.deleted_at), None)
            if not primary and item.images:
                primary = next((img for img in item.images if not img.deleted_at), None)
            r.primary_image_url = primary.url if primary else None
            reads.append(r)
        return PaginatedResponse.create(reads, total, params)

    async def get_item(self, item_id: UUID, user_id: UUID) -> ItemDetailRead:
        item = await self.repo.get_detail(item_id, user_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Item not found")
        r = ItemDetailRead.model_validate(item)
        r.labels = [il.label for il in item.item_labels if il.label and il.label.deleted_at is None]
        active_images = [img for img in item.images if not img.deleted_at]
        r.images = active_images
        primary = next((img for img in active_images if img.is_primary), None) or (active_images[0] if active_images else None)
        r.primary_image_url = primary.url if primary else None
        if item.warranty and item.warranty.deleted_at is None:
            from datetime import date
            w = item.warranty
            from app.schemas.item import WarrantyRead
            wr = WarrantyRead.model_validate(w)
            wr.is_active = bool(w.end_date and w.end_date >= date.today())
            r.warranty = wr
        return r

    async def create_item(self, user_id: UUID, data: ItemCreate) -> ItemDetailRead:
        if data.location_id:
            loc = await self.loc_repo.get_by_id(data.location_id, user_id)
            if not loc:
                raise HTTPException(status_code=404, detail="Location not found")
        if data.category_id:
            cat = await self.cat_repo.get_by_id(data.category_id, user_id)
            if not cat:
                raise HTTPException(status_code=404, detail="Category not found")

        item_data = data.model_dump(exclude={"label_ids", "purchase_price", "purchase_date", "purchased_from"})
        item_data["user_id"] = user_id
        item = await self.repo.create(item_data)

        if data.label_ids:
            await self.repo.replace_labels(item.id, data.label_ids)

        if any([data.purchase_price, data.purchase_date, data.purchased_from]):
            await self.purchase_repo.create({
                "item_id": item.id,
                "user_id": user_id,
                "purchase_price": data.purchase_price,
                "purchase_date": data.purchase_date,
                "purchased_from": data.purchased_from,
            })

        return await self.get_item(item.id, user_id)

    async def update_item(self, item_id: UUID, user_id: UUID, data: ItemUpdate) -> ItemDetailRead:
        item = await self.repo.get_by_id(item_id, user_id)
        if not item:
            raise HTTPException(status_code=404, detail="Item not found")

        update_data = data.model_dump(exclude_none=True, exclude={"label_ids", "purchase_price", "purchase_date", "purchased_from"})
        if update_data:
            await self.repo.update(item_id, user_id, update_data)

        if data.label_ids is not None:
            await self.repo.replace_labels(item_id, data.label_ids)

        if any([data.purchase_price is not None, data.purchase_date is not None, data.purchased_from is not None]):
            existing = await self.purchase_repo.get_by_item(item_id, user_id)
            purchase_data = {}
            if data.purchase_price is not None:
                purchase_data["purchase_price"] = data.purchase_price
            if data.purchase_date is not None:
                purchase_data["purchase_date"] = data.purchase_date
            if data.purchased_from is not None:
                purchase_data["purchased_from"] = data.purchased_from
            if existing:
                await self.purchase_repo.update(existing.id, user_id, purchase_data)
            else:
                purchase_data.update({"item_id": item_id, "user_id": user_id})
                await self.purchase_repo.create(purchase_data)

        return await self.get_item(item_id, user_id)

    async def delete_item(self, item_id: UUID, user_id: UUID) -> None:
        deleted = await self.repo.soft_delete(item_id, user_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Item not found")
