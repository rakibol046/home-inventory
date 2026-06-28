from uuid import UUID

from sqlalchemy import select

from app.models.purchase_record import PurchaseRecord
from app.repositories.base_repository import BaseRepository


class PurchaseRepository(BaseRepository[PurchaseRecord]):
    model = PurchaseRecord

    async def get_by_item(self, item_id: UUID, user_id: UUID) -> PurchaseRecord | None:
        stmt = select(PurchaseRecord).where(
            PurchaseRecord.item_id == item_id,
            PurchaseRecord.user_id == user_id,
            PurchaseRecord.deleted_at.is_(None),
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
