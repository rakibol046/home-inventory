import uuid
from datetime import datetime, timedelta, timezone

from fastapi import HTTPException, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
    verify_refresh_token,
)
from app.repositories.refresh_token_repository import RefreshTokenRepository
from app.repositories.settings_repository import SettingsRepository
from app.repositories.user_repository import UserRepository
from app.schemas.auth import LoginRequest, RefreshRequest, RegisterRequest, TokenResponse
from app.core.config import settings


class AuthService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.user_repo = UserRepository(db)
        self.token_repo = RefreshTokenRepository(db)
        self.settings_repo = SettingsRepository(db)

    async def register(self, data: RegisterRequest, request: Request) -> TokenResponse:
        if await self.user_repo.get_by_email(data.email):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")
        if await self.user_repo.get_by_username(data.username):
            raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Username already taken")

        user = await self.user_repo.create({
            "email": data.email,
            "username": data.username,
            "password_hash": hash_password(data.password),
            "full_name": data.full_name,
        })
        await self.settings_repo.create(user.id)
        return await self._issue_tokens(user, request, remember_me=False)

    async def login(self, data: LoginRequest, request: Request) -> TokenResponse:
        user = await self.user_repo.get_by_email(data.username) or await self.user_repo.get_by_username(data.username)
        if not user or not verify_password(data.password, user.password_hash):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
        if not user.is_active:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Account disabled")
        return await self._issue_tokens(user, request, remember_me=data.rememberMe)

    async def refresh(self, data: RefreshRequest, request: Request) -> TokenResponse:
        # Find the token by iterating valid tokens for brute-force resistance
        # In production you'd use a lookup by hash stored as a searchable indexed field
        from sqlalchemy import select
        from app.models.refresh_token import RefreshToken
        now = datetime.now(timezone.utc)

        # Hash the incoming token and look it up
        # We store hashes but need to verify — use bcrypt verify approach
        # Find unexpired tokens and verify against the raw token
        result = await self.db.execute(
            select(RefreshToken).where(
                RefreshToken.expires_at > now,
                RefreshToken.revoked_at.is_(None),
            )
        )
        tokens = result.scalars().all()
        matched = None
        for t in tokens:
            if verify_refresh_token(data.refresh_token, t.token_hash):
                matched = t
                break

        if not matched:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

        # Theft detection: if this token was already revoked, revoke entire family
        if matched.revoked_at is not None:
            await self.token_repo.revoke_family(matched.family)
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token reuse detected")

        # Revoke old token
        await self.token_repo.revoke(matched.id)

        user = await self.user_repo.get_by_id_raw(matched.user_id)
        if not user or not user.is_active:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return await self._issue_tokens(user, request, remember_me=False, family=matched.family)

    async def logout(self, raw_refresh_token: str) -> None:
        now = datetime.now(timezone.utc)
        from sqlalchemy import select
        from app.models.refresh_token import RefreshToken
        result = await self.db.execute(
            select(RefreshToken).where(RefreshToken.expires_at > now, RefreshToken.revoked_at.is_(None))
        )
        for t in result.scalars():
            if verify_refresh_token(raw_refresh_token, t.token_hash):
                await self.token_repo.revoke(t.id)
                return

    async def _issue_tokens(self, user, request: Request, remember_me: bool, family: uuid.UUID | None = None) -> TokenResponse:
        access = create_access_token(str(user.id), user.email)
        raw_refresh = generate_refresh_token()
        refresh_hash = hash_refresh_token(raw_refresh)
        days = 30 if remember_me else settings.REFRESH_TOKEN_EXPIRE_DAYS
        expires = datetime.now(timezone.utc) + timedelta(days=days)

        await self.token_repo.create({
            "user_id": user.id,
            "token_hash": refresh_hash,
            "family": family or uuid.uuid4(),
            "expires_at": expires,
            "user_agent": request.headers.get("user-agent"),
            "ip_address": request.client.host if request.client else None,
        })
        return TokenResponse(token=access, refresh_token=raw_refresh)
