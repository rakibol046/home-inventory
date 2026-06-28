from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse
from app.schemas.user import UserRead, UserUpdate

router = APIRouter(tags=["users"])


@router.post("/users/register", response_model=TokenResponse, status_code=201)
async def register(data: RegisterRequest, request: Request, db: AsyncSession = Depends(get_db)):
    from app.services.auth_service import AuthService
    return await AuthService(db).register(data, request)


@router.post("/users/login", response_model=TokenResponse)
async def login(data: LoginRequest, request: Request, db: AsyncSession = Depends(get_db)):
    from app.services.auth_service import AuthService
    return await AuthService(db).login(data, request)


@router.get("/users/me", response_model=UserRead)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.patch("/users/me", response_model=UserRead)
async def update_me(
    data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.user_repository import UserRepository
    repo = UserRepository(db)
    return await repo.update(current_user, data.model_dump(exclude_none=True))
