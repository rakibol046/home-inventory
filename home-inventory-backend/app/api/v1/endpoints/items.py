import csv
import io
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, File, Query, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.item import ItemCreate, ItemDetailRead, ItemRead, ItemUpdate
from app.schemas.warranty import WarrantyCreate, WarrantyUpdate
from app.utils.pagination import PaginatedResponse, PaginationParams

router = APIRouter(tags=["items"])


@router.get("/items", response_model=PaginatedResponse[ItemRead])
async def list_items(
    search: Optional[str] = Query(None),
    location_id: Optional[UUID] = Query(None),
    category_id: Optional[UUID] = Query(None),
    label_id: Optional[UUID] = Query(None),
    sort_by: str = Query(default="updated_at", pattern="^(name|updated_at|purchase_price|created_at)$"),
    params: PaginationParams = Depends(),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.item_service import ItemService
    return await ItemService(db).list_items(
        current_user.id, params, search, location_id, category_id, label_id, sort_by
    )


@router.post("/items", response_model=ItemDetailRead, status_code=201)
async def create_item(
    data: ItemCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.item_service import ItemService
    return await ItemService(db).create_item(current_user.id, data)


@router.get("/items/export")
async def export_items(
    format: str = Query(default="csv"),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.item_repository import ItemRepository
    items, _ = await ItemRepository(db).list_paginated(current_user.id, 0, 10000)
    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["Name", "Brand", "Model", "Serial Number", "Condition", "Quantity", "Notes"])
    for item in items:
        writer.writerow([item.name, item.brand, item.model_number, item.serial_number, item.condition, item.quantity, item.notes])
    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=inventory.csv"},
    )


@router.get("/items/{item_id}", response_model=ItemDetailRead)
async def get_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.item_service import ItemService
    return await ItemService(db).get_item(item_id, current_user.id)


@router.patch("/items/{item_id}", response_model=ItemDetailRead)
async def update_item(
    item_id: UUID,
    data: ItemUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.item_service import ItemService
    return await ItemService(db).update_item(item_id, current_user.id, data)


@router.delete("/items/{item_id}", status_code=204)
async def delete_item(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.services.item_service import ItemService
    await ItemService(db).delete_item(item_id, current_user.id)


# --- Item Images ---

@router.post("/items/{item_id}/images", status_code=201)
async def upload_image(
    item_id: UUID,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.item_repository import ItemRepository
    from app.repositories.image_repository import ImageRepository
    from app.utils.file_storage import save_upload

    item = await ItemRepository(db).get_by_id(item_id, current_user.id)
    if not item:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Item not found")

    saved = await save_upload(file, subfolder="items")
    image_repo = ImageRepository(db)
    existing = await image_repo.list_for_item(item_id, current_user.id)
    img = await image_repo.create({
        "item_id": item_id,
        "user_id": current_user.id,
        "url": saved["url"],
        "filename": saved["filename"],
        "file_size": saved["file_size"],
        "mime_type": saved["mime_type"],
        "is_primary": len(existing) == 0,
        "display_order": len(existing),
    })
    return img


@router.delete("/items/{item_id}/images/{image_id}", status_code=204)
async def delete_image(
    item_id: UUID,
    image_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.image_repository import ImageRepository
    await ImageRepository(db).soft_delete(image_id, current_user.id)


# --- Item Labels ---

@router.post("/items/{item_id}/labels/{label_id}", status_code=201)
async def attach_label(
    item_id: UUID,
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.item_repository import ItemRepository
    from app.repositories.label_repository import LabelRepository
    from fastapi import HTTPException

    if not await ItemRepository(db).get_by_id(item_id, current_user.id):
        raise HTTPException(status_code=404, detail="Item not found")
    if not await LabelRepository(db).get_by_id(label_id, current_user.id):
        raise HTTPException(status_code=404, detail="Label not found")
    await ItemRepository(db).attach_label(item_id, label_id)
    return {"message": "Label attached"}


@router.delete("/items/{item_id}/labels/{label_id}", status_code=204)
async def detach_label(
    item_id: UUID,
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.item_repository import ItemRepository
    await ItemRepository(db).detach_label(item_id, label_id)


# --- Item Warranty ---

@router.get("/items/{item_id}/warranty")
async def get_warranty(
    item_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.warranty_repository import WarrantyRepository
    from app.schemas.item import WarrantyRead
    from datetime import date

    w = await WarrantyRepository(db).get_by_item(item_id, current_user.id)
    if not w:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Warranty not found")
    result = WarrantyRead.model_validate(w)
    result.is_active = bool(w.end_date and w.end_date >= date.today())
    return result


@router.post("/items/{item_id}/warranty", status_code=201)
async def create_warranty(
    item_id: UUID,
    data: WarrantyCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.warranty_repository import WarrantyRepository
    from app.repositories.item_repository import ItemRepository
    from app.schemas.item import WarrantyRead
    from datetime import date
    from fastapi import HTTPException

    if not await ItemRepository(db).get_by_id(item_id, current_user.id):
        raise HTTPException(status_code=404, detail="Item not found")
    repo = WarrantyRepository(db)
    if await repo.get_by_item(item_id, current_user.id):
        raise HTTPException(status_code=409, detail="Warranty already exists")
    w = await repo.create({**data.model_dump(), "item_id": item_id, "user_id": current_user.id})
    result = WarrantyRead.model_validate(w)
    result.is_active = bool(w.end_date and w.end_date >= date.today())
    return result


@router.patch("/items/{item_id}/warranty")
async def update_warranty(
    item_id: UUID,
    data: WarrantyUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.warranty_repository import WarrantyRepository
    from app.schemas.item import WarrantyRead
    from datetime import date
    from fastapi import HTTPException

    repo = WarrantyRepository(db)
    w = await repo.get_by_item(item_id, current_user.id)
    if not w:
        raise HTTPException(status_code=404, detail="Warranty not found")
    updated = await repo.update(w.id, current_user.id, data.model_dump(exclude_none=True))
    result = WarrantyRead.model_validate(updated)
    result.is_active = bool(updated.end_date and updated.end_date >= date.today())
    return result
