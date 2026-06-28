import uuid

from sqlalchemy import Boolean, Index, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class User(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    is_verified: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    avatar_url: Mapped[str | None] = mapped_column(Text, nullable=True)

    refresh_tokens: Mapped[list["RefreshToken"]] = relationship(  # noqa: F821
        "RefreshToken", back_populates="user", cascade="all, delete-orphan"
    )
    categories: Mapped[list["Category"]] = relationship(  # noqa: F821
        "Category", back_populates="user", cascade="all, delete-orphan"
    )
    labels: Mapped[list["Label"]] = relationship(  # noqa: F821
        "Label", back_populates="user", cascade="all, delete-orphan"
    )
    rooms: Mapped[list["Room"]] = relationship(  # noqa: F821
        "Room", back_populates="user", cascade="all, delete-orphan"
    )
    inventory_items: Mapped[list["InventoryItem"]] = relationship(  # noqa: F821
        "InventoryItem", back_populates="user", cascade="all, delete-orphan"
    )
    notifications: Mapped[list["Notification"]] = relationship(  # noqa: F821
        "Notification", back_populates="user", cascade="all, delete-orphan"
    )
    reminder_schedules: Mapped[list["ReminderSchedule"]] = relationship(  # noqa: F821
        "ReminderSchedule", back_populates="user", cascade="all, delete-orphan"
    )
    settings: Mapped["UserSettings | None"] = relationship(  # noqa: F821
        "UserSettings", back_populates="user", cascade="all, delete-orphan", uselist=False
    )
