import uuid

from sqlalchemy import Boolean, ForeignKey, SmallInteger, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin


class UserSettings(Base, TimestampMixin):
    __tablename__ = "user_settings"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, unique=True, index=True
    )
    currency: Mapped[str] = mapped_column(String(3), nullable=False, default="USD")
    timezone: Mapped[str] = mapped_column(String(50), nullable=False, default="UTC")
    date_format: Mapped[str] = mapped_column(String(20), nullable=False, default="YYYY-MM-DD")
    language: Mapped[str] = mapped_column(String(10), nullable=False, default="en")
    notification_email: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    warranty_alert_days: Mapped[int] = mapped_column(SmallInteger, nullable=False, default=30)

    user: Mapped["User"] = relationship("User", back_populates="settings")  # noqa: F821
