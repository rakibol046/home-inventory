import uuid
from datetime import datetime, timezone
from uuid import UUID

from sqlalchemy import select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.refresh_token import RefreshToken


class RefreshTokenRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def create(self, data: dict) -> RefreshToken:
        token = RefreshToken(**data)
        self.db.add(token)
        await self.db.commit()
        await self.db.refresh(token)
        return token

    async def get_by_hash(self, token_hash: str) -> RefreshToken | None:
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.token_hash == token_hash)
        )
        return result.scalar_one_or_none()

    async def find_valid_by_user(self, user_id: UUID) -> list[RefreshToken]:
        now = datetime.now(timezone.utc)
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.user_id == user_id,
                RefreshToken.revoked_at.is_(None),
                RefreshToken.expires_at > now,
            )
        )
        return list(result.scalars().all())

    async def revoke(self, token_id: UUID) -> None:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.id == token_id)
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def revoke_family(self, family: UUID) -> None:
        stmt = (
            update(RefreshToken)
            .where(RefreshToken.family == family, RefreshToken.revoked_at.is_(None))
            .values(revoked_at=datetime.now(timezone.utc))
        )
        await self.db.execute(stmt)
        await self.db.commit()

    async def delete_expired(self) -> int:
        from sqlalchemy import delete
        now = datetime.now(timezone.utc)
        stmt = delete(RefreshToken).where(RefreshToken.expires_at < now)
        result = await self.db.execute(stmt)
        await self.db.commit()
        return result.rowcount
