from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.label import LabelCreate, LabelRead, LabelUpdate

router = APIRouter(tags=["labels"])


@router.get("/labels", response_model=list[LabelRead])
async def list_labels(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.label_repository import LabelRepository
    return await LabelRepository(db).list(current_user.id, limit=500)


@router.post("/labels", response_model=LabelRead, status_code=201)
async def create_label(
    data: LabelCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.label_repository import LabelRepository
    return await LabelRepository(db).create({**data.model_dump(), "user_id": current_user.id})


@router.patch("/labels/{label_id}", response_model=LabelRead)
async def update_label(
    label_id: UUID,
    data: LabelUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.label_repository import LabelRepository
    result = await LabelRepository(db).update(label_id, current_user.id, data.model_dump(exclude_none=True))
    if not result:
        raise HTTPException(status_code=404, detail="Label not found")
    return result


@router.delete("/labels/{label_id}", status_code=204)
async def delete_label(
    label_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.label_repository import LabelRepository
    deleted = await LabelRepository(db).soft_delete(label_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Label not found")
