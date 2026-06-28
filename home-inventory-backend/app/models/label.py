import uuid

from sqlalchemy import ForeignKey, String, UniqueConstraint
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class Label(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "labels"
    __table_args__ = (
        UniqueConstraint("user_id", "name", name="uq_labels_user_name"),
    )

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    color_bg: Mapped[str] = mapped_column(String(7), nullable=False, default="#DBEAFE")
    color_text: Mapped[str] = mapped_column(String(7), nullable=False, default="#1D4ED8")

    user: Mapped["User"] = relationship("User", back_populates="labels")  # noqa: F821
    item_labels: Mapped[list["ItemLabel"]] = relationship(  # noqa: F821
        "ItemLabel", back_populates="label", cascade="all, delete-orphan"
    )
