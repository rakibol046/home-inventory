import uuid
from datetime import date, datetime
from decimal import Decimal

from pydantic import BaseModel, Field

from app.schemas.label import LabelRead
from app.schemas.location import LocationWithRoom


class ItemImageRead(BaseModel):
    id: uuid.UUID
    url: str
    filename: str
    is_primary: bool
    display_order: int

    model_config = {"from_attributes": True}


class WarrantyRead(BaseModel):
    id: uuid.UUID
    provider: str | None
    warranty_type: str | None
    start_date: date | None
    end_date: date | None
    notes: str | None
    is_active: bool = False

    model_config = {"from_attributes": True}

    @classmethod
    def from_orm_with_active(cls, obj):
        from datetime import date as _date
        data = cls.model_validate(obj)
        if obj.end_date and obj.deleted_at is None:
            data.is_active = obj.end_date >= _date.today()
        return data


class PurchaseRead(BaseModel):
    id: uuid.UUID
    purchased_from: str | None
    purchase_date: date | None
    purchase_price: Decimal | None
    currency: str
    order_number: str | None

    model_config = {"from_attributes": True}


class ItemCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    brand: str | None = Field(None, max_length=100)
    model_number: str | None = Field(None, max_length=100)
    serial_number: str | None = Field(None, max_length=100)
    color: str | None = Field(None, max_length=50)
    condition: str | None = Field(None, max_length=50)
    quantity: int = Field(default=1, ge=0)
    notes: str | None = None
    is_insured: bool = False
    location_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    label_ids: list[uuid.UUID] = []
    # Optional purchase info inline
    purchase_price: Decimal | None = None
    purchase_date: date | None = None
    purchased_from: str | None = None


class ItemUpdate(BaseModel):
    name: str | None = Field(None, min_length=1, max_length=255)
    brand: str | None = None
    model_number: str | None = None
    serial_number: str | None = None
    color: str | None = None
    condition: str | None = None
    quantity: int | None = Field(None, ge=0)
    notes: str | None = None
    is_insured: bool | None = None
    location_id: uuid.UUID | None = None
    category_id: uuid.UUID | None = None
    label_ids: list[uuid.UUID] | None = None
    purchase_price: Decimal | None = None
    purchase_date: date | None = None
    purchased_from: str | None = None


class ItemRead(BaseModel):
    id: uuid.UUID
    name: str
    brand: str | None
    model_number: str | None
    serial_number: str | None
    color: str | None
    condition: str | None
    quantity: int
    notes: str | None
    is_insured: bool
    location_id: uuid.UUID | None
    category_id: uuid.UUID | None
    updated_at: datetime
    created_at: datetime
    labels: list[LabelRead] = []
    primary_image_url: str | None = None

    model_config = {"from_attributes": True}


class ItemDetailRead(ItemRead):
    location: LocationWithRoom | None = None
    images: list[ItemImageRead] = []
    warranty: WarrantyRead | None = None
    purchase_record: PurchaseRead | None = None
