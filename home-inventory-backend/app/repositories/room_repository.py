from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.room import Room
from app.repositories.base_repository import BaseRepository


class RoomRepository(BaseRepository[Room]):
    model = Room

    async def list_with_locations(self, user_id: UUID) -> list[Room]:
        stmt = (
            select(Room)
            .options(selectinload(Room.locations))
            .where(Room.user_id == user_id, Room.deleted_at.is_(None))
            .order_by(Room.name)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())
