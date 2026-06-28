from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import get_current_user, get_db
from app.models.user import User
from app.schemas.location import LocationCreate, LocationUpdate, LocationWithRoom, RoomCreate, RoomUpdate, RoomWithLocations

router = APIRouter(tags=["locations"])


# --- Rooms ---

@router.get("/rooms", response_model=list[RoomWithLocations])
async def list_rooms(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.room_repository import RoomRepository
    rooms = await RoomRepository(db).list_with_locations(current_user.id)
    return rooms


@router.post("/rooms", response_model=RoomWithLocations, status_code=201)
async def create_room(
    data: RoomCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.room_repository import RoomRepository
    room = await RoomRepository(db).create({**data.model_dump(), "user_id": current_user.id})
    return room


@router.patch("/rooms/{room_id}", response_model=RoomWithLocations)
async def update_room(
    room_id: UUID,
    data: RoomUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.room_repository import RoomRepository
    from fastapi import HTTPException
    repo = RoomRepository(db)
    room = await repo.update(room_id, current_user.id, data.model_dump(exclude_none=True))
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    return room


@router.delete("/rooms/{room_id}", status_code=204)
async def delete_room(
    room_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.room_repository import RoomRepository
    from fastapi import HTTPException
    deleted = await RoomRepository(db).soft_delete(room_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Room not found")


# --- Locations ---

@router.get("/locations", response_model=list[LocationWithRoom])
async def list_locations(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.location_repository import LocationRepository
    return await LocationRepository(db).list_with_room(current_user.id)


@router.post("/locations", response_model=LocationWithRoom, status_code=201)
async def create_location(
    data: LocationCreate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.location_repository import LocationRepository
    from app.repositories.room_repository import RoomRepository
    from fastapi import HTTPException

    room = await RoomRepository(db).get_by_id(data.room_id, current_user.id)
    if not room:
        raise HTTPException(status_code=404, detail="Room not found")
    loc = await LocationRepository(db).create({**data.model_dump(), "user_id": current_user.id})
    return await LocationRepository(db).get_by_id_with_room(loc.id, current_user.id)


@router.patch("/locations/{location_id}", response_model=LocationWithRoom)
async def update_location(
    location_id: UUID,
    data: LocationUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.location_repository import LocationRepository
    from fastapi import HTTPException
    repo = LocationRepository(db)
    loc = await repo.update(location_id, current_user.id, data.model_dump(exclude_none=True))
    if not loc:
        raise HTTPException(status_code=404, detail="Location not found")
    return await repo.get_by_id_with_room(location_id, current_user.id)


@router.delete("/locations/{location_id}", status_code=204)
async def delete_location(
    location_id: UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    from app.repositories.location_repository import LocationRepository
    from fastapi import HTTPException
    deleted = await LocationRepository(db).soft_delete(location_id, current_user.id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Location not found")
