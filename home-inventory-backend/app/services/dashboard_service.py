from datetime import date, timedelta
from decimal import Decimal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.category import Category
from app.models.inventory_item import InventoryItem
from app.models.location import Location
from app.models.notification import Notification
from app.models.purchase_record import PurchaseRecord
from app.models.warranty import Warranty
from app.schemas.dashboard import CategoryStat, DashboardStats, LocationStat, RecentActivity


class DashboardService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def get_stats(self, user_id: UUID) -> DashboardStats:
        # Total items
        total_items = (await self.db.execute(
            select(func.count(InventoryItem.id)).where(
                InventoryItem.user_id == user_id, InventoryItem.deleted_at.is_(None)
            )
        )).scalar_one()

        # Total locations
        total_locations = (await self.db.execute(
            select(func.count(Location.id)).where(
                Location.user_id == user_id, Location.deleted_at.is_(None)
            )
        )).scalar_one()

        # Active warranties
        today = date.today()
        active_warranties = (await self.db.execute(
            select(func.count(Warranty.id)).where(
                Warranty.user_id == user_id,
                Warranty.deleted_at.is_(None),
                Warranty.end_date >= today,
            )
        )).scalar_one()

        # Expiring warranties in 30 days
        expiry_cutoff = today + timedelta(days=30)
        expiring = (await self.db.execute(
            select(func.count(Warranty.id)).where(
                Warranty.user_id == user_id,
                Warranty.deleted_at.is_(None),
                Warranty.end_date >= today,
                Warranty.end_date <= expiry_cutoff,
            )
        )).scalar_one()

        # Total value
        total_value_result = (await self.db.execute(
            select(func.sum(PurchaseRecord.purchase_price)).where(
                PurchaseRecord.user_id == user_id, PurchaseRecord.deleted_at.is_(None)
            )
        )).scalar_one()
        total_value = float(total_value_result or 0)

        # Items by category
        cat_rows = (await self.db.execute(
            select(Category.name, Category.color, func.count(InventoryItem.id))
            .join(InventoryItem, InventoryItem.category_id == Category.id)
            .where(
                InventoryItem.user_id == user_id,
                InventoryItem.deleted_at.is_(None),
                Category.deleted_at.is_(None),
            )
            .group_by(Category.name, Category.color)
            .order_by(func.count(InventoryItem.id).desc())
            .limit(10)
        )).all()

        # Items by location
        loc_rows = (await self.db.execute(
            select(Location.name, func.count(InventoryItem.id))
            .join(InventoryItem, InventoryItem.location_id == Location.id)
            .where(
                InventoryItem.user_id == user_id,
                InventoryItem.deleted_at.is_(None),
                Location.deleted_at.is_(None),
            )
            .group_by(Location.name)
            .order_by(func.count(InventoryItem.id).desc())
            .limit(5)
        )).all()

        # Recent activity from notifications
        notif_rows = (await self.db.execute(
            select(Notification).where(
                Notification.user_id == user_id, Notification.deleted_at.is_(None)
            ).order_by(Notification.created_at.desc()).limit(5)
        )).scalars().all()

        return DashboardStats(
            total_items=total_items,
            total_locations=total_locations,
            active_warranties=active_warranties,
            expiring_warranties_30d=expiring,
            total_value=total_value,
            items_by_category=[CategoryStat(name=r[0], color=r[1], count=r[2]) for r in cat_rows],
            items_by_location=[LocationStat(name=r[0], count=r[1]) for r in loc_rows],
            recent_activity=[RecentActivity(type=n.type, title=n.title, message=n.message) for n in notif_rows],
        )
