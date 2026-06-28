import uuid
from pydantic import BaseModel, Field


class SettingsRead(BaseModel):
    id: uuid.UUID
    currency: str
    timezone: str
    date_format: str
    language: str
    notification_email: bool
    warranty_alert_days: int

    model_config = {"from_attributes": True}


class SettingsUpdate(BaseModel):
    currency: str | None = Field(None, max_length=3)
    timezone: str | None = Field(None, max_length=50)
    date_format: str | None = Field(None, max_length=20)
    language: str | None = Field(None, max_length=10)
    notification_email: bool | None = None
    warranty_alert_days: int | None = Field(None, ge=1, le=365)
