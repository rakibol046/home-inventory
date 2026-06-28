import uuid

from sqlalchemy import ForeignKey, SmallInteger, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, SoftDeleteMixin, TimestampMixin


class Room(Base, TimestampMixin, SoftDeleteMixin):
    __tablename__ = "rooms"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    floor: Mapped[int | None] = mapped_column(SmallInteger, nullable=True)

    user: Mapped["User"] = relationship("User", back_populates="rooms")  # noqa: F821
    locations: Mapped[list["Location"]] = relationship(  # noqa: F821
        "Location", back_populates="room", cascade="all, delete-orphan", lazy="selectin"
    )
