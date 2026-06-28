from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.category import CategoryCreate, CategoryRead, CategoryUpdate

router = APIRouter(tags=["categories"])


@router.get("/categories", response_model=list[CategoryRead])
async def list_categories(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.category_repository import CategoryRepository
    return await CategoryRepository(db).list(current_user.id, limit=500)


@router.post("/categories", response_model=CategoryRead, status_code=201)
async def create_category(
    data: CategoryCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.category_repository import CategoryRepository
    return await CategoryRepository(db).create({**data.model_dump(), "user_id": current_user.id})


@router.patch("/categories/{category_id}", response_model=CategoryRead)
async def update_category(
    category_id: UUID,
    data: CategoryUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.category_repository import CategoryRepository
    repo = CategoryRepository(db)
    result = await repo.update(category_id, current_user.id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Category not found")
    return result


@router.delete("/categories/{category_id}", status_code=204)
async def delete_category(
    category_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.category_repository import CategoryRepository
    deleted = await CategoryRepository(db).soft_delete(category_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Category not found")
