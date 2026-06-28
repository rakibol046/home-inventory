from uuid import UUID

from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.models.location import Location
from app.repositories.base_repository import BaseRepository


class LocationRepository(BaseRepository[Location]):
    model = Location

    async def list_with_room(self, user_id: UUID) -> list[Location]:
        stmt = (
            select(Location)
            .options(selectinload(Location.room))
            .where(Location.user_id == user_id, Location.deleted_at.is_(None))
            .order_by(Location.name)
        )
        result = await self.db.execute(stmt)
        return list(result.scalars().unique().all())

    async def get_by_id_with_room(self, location_id: UUID, user_id: UUID) -> Location | None:
        stmt = (
            select(Location)
            .options(selectinload(Location.room))
            .where(Location.id == location_id, Location.user_id == user_id, Location.deleted_at.is_(None))
        )
        result = await self.db.execute(stmt)
        return result.scalar_one_or_none()
