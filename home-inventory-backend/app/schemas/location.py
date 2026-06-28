import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class RoomCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: str | None = None
    floor: int | None = None


class RoomUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    description: str | None = None
    floor: int | None = None


class RoomRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    floor: int | None
    created_at: datetime

    model_config = {"from_attributes": True}


class RoomWithLocations(RoomRead):
    locations: list["LocationRead"] = []


class LocationCreate(BaseModel):
    room_id: uuid.UUID
    name: str = Field(..., min_length=1, max_length=150)
    description: str | None = None


class LocationUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=150)
    description: str | None = None
    room_id: uuid.UUID | None = None


class LocationRead(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    room_id: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}


class LocationWithRoom(LocationRead):
    room: RoomRead | None = None
