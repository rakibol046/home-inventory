import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_dashboard_stats_empty(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_items"] == 0
    assert data["total_locations"] == 0
    assert data["active_warranties"] == 0
    assert data["total_value"] == 0
    assert data["items_by_category"] == []
    assert data["items_by_location"] == []


@pytest.mark.asyncio
async def test_dashboard_stats_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/dashboard/stats")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_dashboard_with_items(client: AsyncClient, auth_headers):
    # Create a category
    cat = await client.post("/api/v1/categories", headers=auth_headers, json={"name": "Electronics", "color": "#3B82F6"})
    assert cat.status_code == 201

    # Create an item with category
    item = await client.post("/api/v1/items", headers=auth_headers, json={
        "name": "Laptop",
        "quantity": 1,
        "category_id": cat.json()["id"],
        "purchase_price": 1500.00,
    })
    assert item.status_code == 201

    # Check dashboard reflects the item
    resp = await client.get("/api/v1/dashboard/stats", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total_items"] == 1
    assert data["total_value"] == 1500.0
    assert len(data["items_by_category"]) == 1
    assert data["items_by_category"][0]["name"] == "Electronics"
    assert data["items_by_category"][0]["count"] == 1
