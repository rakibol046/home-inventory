from pydantic import BaseModel


class CategoryStat(BaseModel):
    name: str
    count: int
    color: str | None = None


class LocationStat(BaseModel):
    name: str
    count: int


class RecentActivity(BaseModel):
    type: str
    title: str
    message: str


class DashboardStats(BaseModel):
    total_items: int
    total_locations: int
    active_warranties: int
    expiring_warranties_30d: int
    total_value: float
    items_by_category: list[CategoryStat]
    items_by_location: list[LocationStat]
    recent_activity: list[RecentActivity]
