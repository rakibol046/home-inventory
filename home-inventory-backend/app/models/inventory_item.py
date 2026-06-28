import uuid

from sqlalchemy import Boolean, CheckConstraint, ForeignKey, Index, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class InventoryItem(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "inventory_items"
    __table_args__ = (
        CheckConstraint("quantity >= 0", name="ck_inventory_items_quantity"),
        Index("ix_inventory_items_name", "name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    location_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("locations.id", ondelete="SET NULL"), nullable=True, index=True
    )
    category_id: Mapped[uuid.UUID | None] = mapped_column(
        UUID(as_uuid=True), ForeignKey("categories.id", ondelete="SET NULL"), nullable=True, index=True
    )

    name: Mapped[str] = mapped_column(String(255), nullable=False)
    brand: Mapped[str | None] = mapped_column(String(100), nullable=True)
    model_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    serial_number: Mapped[str | None] = mapped_column(String(100), nullable=True)
    color: Mapped[str | None] = mapped_column(String(50), nullable=True)
    condition: Mapped[str | None] = mapped_column(String(50), nullable=True)
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=1)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_insured: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)

    user: Mapped["User"] = relationship("User", back_populates="inventory_items")  # noqa: F821
    location: Mapped["Location | None"] = relationship("Location", back_populates="inventory_items")  # noqa: F821
    category: Mapped["Category | None"] = relationship("Category", back_populates="inventory_items")  # noqa: F821
    images: Mapped[list["ItemImage"]] = relationship(  # noqa: F821
        "ItemImage", back_populates="item", cascade="all, delete-orphan",
        primaryjoin="and_(ItemImage.item_id == InventoryItem.id, ItemImage.deleted_at.is_(None))",
        lazy="select",
    )
    item_labels: Mapped[list["ItemLabel"]] = relationship(  # noqa: F821
        "ItemLabel", back_populates="item", cascade="all, delete-orphan"
    )
    warranty: Mapped["Warranty | None"] = relationship(  # noqa: F821
        "Warranty", back_populates="item", cascade="all, delete-orphan", uselist=False
    )
    purchase_record: Mapped["PurchaseRecord | None"] = relationship(  # noqa: F821
        "PurchaseRecord", back_populates="item", cascade="all, delete-orphan", uselist=False
    )
