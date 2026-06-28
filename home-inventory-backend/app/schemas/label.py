import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class LabelCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    color_bg: str = Field(default="#DBEAFE", pattern=r"^#[0-9A-Fa-f]{6}$")
    color_text: str = Field(default="#1D4ED8", pattern=r"^#[0-9A-Fa-f]{6}$")


class LabelUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=100)
    color_bg: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")
    color_text: str | None = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$")


class LabelRead(BaseModel):
    id: uuid.UUID
    name: str
    color_bg: str
    color_text: str
    created_at: datetime

    model_config = {"from_attributes": True}
