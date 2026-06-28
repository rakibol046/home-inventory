import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class WarrantyCreate(BaseModel):
    provider: str | None = Field(None, max_length=100)
    warranty_type: str | None = Field(None, max_length=50)
    start_date: date | None = None
    end_date: date | None = None
    document_url: str | None = None
    notes: str | None = None


class WarrantyUpdate(BaseModel):
    provider: str | None = None
    warranty_type: str | None = None
    start_date: date | None = None
    end_date: date | None = None
    document_url: str | None = None
    notes: str | None = None
