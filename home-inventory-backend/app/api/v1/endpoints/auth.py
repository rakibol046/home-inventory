from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_db
from app.schemas.auth import RefreshRequest, TokenResponse
from app.schemas.common import MessageResponse

router = APIRouter(tags=["auth"])


@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(data: RefreshRequest, request: Request, db: AsyncSession = Depends(get_db)):
    from app.services.auth_service import AuthService
    return await AuthService(db).refresh(data, request)


@router.post("/auth/logout", response_model=MessageResponse)
async def logout(data: RefreshRequest, db: AsyncSession = Depends(get_db)):
    from app.services.auth_service import AuthService
    await AuthService(db).logout(data.refresh_token)
    return {"message": "Logged out"}
