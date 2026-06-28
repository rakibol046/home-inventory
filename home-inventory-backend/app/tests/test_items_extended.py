import pytest
from httpx import AsyncClient


@pytest.fixture
async def item_id(client: AsyncClient, auth_headers: dict) -> str:
    resp = await client.post("/api/v1/items", headers=auth_headers, json={
        "name": "Test Item",
        "quantity": 1,
    })
    assert resp.status_code == 201
    return resp.json()["id"]


@pytest.mark.asyncio
async def test_create_item_with_purchase(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/items", headers=auth_headers, json={
        "name": "Laptop",
        "quantity": 1,
        "purchase_price": 1299.99,
        "purchased_from": "Best Buy",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["purchase_record"] is not None
    assert float(data["purchase_record"]["purchase_price"]) == 1299.99


@pytest.mark.asyncio
async def test_item_warranty_create(client: AsyncClient, auth_headers, item_id: str):
    resp = await client.post(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={
        "provider": "Sony",
        "warranty_type": "Limited",
        "start_date": "2026-01-01",
        "end_date": "2028-01-01",
        "notes": "International warranty",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["provider"] == "Sony"
    assert data["warranty_type"] == "Limited"
    assert data["is_active"] is True


@pytest.mark.asyncio
async def test_item_warranty_get(client: AsyncClient, auth_headers, item_id: str):
    # Create warranty first
    await client.post(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={
        "provider": "Apple",
        "end_date": "2026-12-31",
    })
    resp = await client.get(f"/api/v1/items/{item_id}/warranty", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["provider"] == "Apple"


@pytest.mark.asyncio
async def test_item_warranty_update(client: AsyncClient, auth_headers, item_id: str):
    await client.post(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={
        "provider": "Dell",
        "end_date": "2025-12-31",
    })
    resp = await client.patch(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={
        "provider": "Dell Extended",
        "end_date": "2027-12-31",
    })
    assert resp.status_code == 200
    assert resp.json()["provider"] == "Dell Extended"


@pytest.mark.asyncio
async def test_item_warranty_missing(client: AsyncClient, auth_headers, item_id: str):
    resp = await client.get(f"/api/v1/items/{item_id}/warranty", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_item_filter_by_category(client: AsyncClient, auth_headers):
    cat = await client.post("/api/v1/categories", headers=auth_headers, json={"name": "Tools"})
    cat_id = cat.json()["id"]
    await client.post("/api/v1/items", headers=auth_headers, json={"name": "Hammer", "quantity": 1, "category_id": cat_id})
    await client.post("/api/v1/items", headers=auth_headers, json={"name": "Screwdriver", "quantity": 1, "category_id": cat_id})
    await client.post("/api/v1/items", headers=auth_headers, json={"name": "Book", "quantity": 1})

    resp = await client.get(f"/api/v1/items?category_id={cat_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 2
    names = {i["name"] for i in data["items"]}
    assert "Hammer" in names
    assert "Screwdriver" in names


@pytest.mark.asyncio
async def test_item_labels_attach_detach(client: AsyncClient, auth_headers, item_id: str):
    # Create a label
    label = await client.post("/api/v1/labels", headers=auth_headers, json={
        "name": "Urgent", "color_bg": "#FEE2E2", "color_text": "#B91C1C"
    })
    assert label.status_code == 201
    label_id = label.json()["id"]

    # Attach label
    attach = await client.post(f"/api/v1/items/{item_id}/labels/{label_id}", headers=auth_headers)
    assert attach.status_code in (200, 201)

    # Get item — label should be present
    item = await client.get(f"/api/v1/items/{item_id}", headers=auth_headers)
    assert any(l["id"] == label_id for l in item.json()["labels"])

    # Detach label
    detach = await client.delete(f"/api/v1/items/{item_id}/labels/{label_id}", headers=auth_headers)
    assert detach.status_code in (200, 204)


@pytest.mark.asyncio
async def test_items_pagination(client: AsyncClient, auth_headers):
    for i in range(5):
        await client.post("/api/v1/items", headers=auth_headers, json={"name": f"Item {i}", "quantity": 1})

    resp = await client.get("/api/v1/items?page=1&page_size=3", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert len(data["items"]) == 3
    assert data["total"] == 5
    assert data["total_pages"] == 2


@pytest.mark.asyncio
async def test_reports_summary(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/reports/summary", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "total_items" in data
