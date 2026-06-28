from uuid import UUID

from sqlalchemy import select

from app.models.warranty import Warranty
from app.repositories.base_repository import BaseRepository


class WarrantyRepository(BaseRepository[Warranty]):
    model = Warranty

    async def get_by_item(self, item_id: UUID, user_id: UUID) -> Warranty | None:
        stmt = select(Warranty).where(
            Warranty.item_id == item_id,
            Warranty.user_id == user_id,
            Warranty.deleted_at.is_(None),
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
