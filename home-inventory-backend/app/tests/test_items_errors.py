import pytest
from httpx import AsyncClient
import uuid


@pytest.mark.asyncio
async def test_export_csv(client: AsyncClient, auth_headers):
    # Create an item first
    await client.post("/api/v1/items", headers=auth_headers, json={"name": "CSV Test", "quantity": 1})
    resp = await client.get("/api/v1/items/export?format=csv", headers=auth_headers)
    assert resp.status_code == 200
    assert "text/csv" in resp.headers.get("content-type", "")
    assert "CSV Test" in resp.text


@pytest.mark.asyncio
async def test_attach_label_item_not_found(client: AsyncClient, auth_headers):
    fake_id = str(uuid.uuid4())
    resp = await client.post(f"/api/v1/items/{fake_id}/labels/{fake_id}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_attach_label_label_not_found(client: AsyncClient, auth_headers):
    # Create real item but fake label
    item = await client.post("/api/v1/items", headers=auth_headers, json={"name": "Item X", "quantity": 1})
    item_id = item.json()["id"]
    fake_id = str(uuid.uuid4())
    resp = await client.post(f"/api/v1/items/{item_id}/labels/{fake_id}", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_warranty_create_item_not_found(client: AsyncClient, auth_headers):
    fake_id = str(uuid.uuid4())
    resp = await client.post(f"/api/v1/items/{fake_id}/warranty", headers=auth_headers, json={"end_date": "2028-01-01"})
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_warranty_create_duplicate(client: AsyncClient, auth_headers):
    item = await client.post("/api/v1/items", headers=auth_headers, json={"name": "Duplicate Warranty", "quantity": 1})
    item_id = item.json()["id"]

    await client.post(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={"end_date": "2028-01-01"})
    resp = await client.post(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={"end_date": "2029-01-01"})
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_warranty_update_not_found(client: AsyncClient, auth_headers):
    item = await client.post("/api/v1/items", headers=auth_headers, json={"name": "No Warranty", "quantity": 1})
    item_id = item.json()["id"]
    resp = await client.patch(f"/api/v1/items/{item_id}/warranty", headers=auth_headers, json={"provider": "Test"})
    assert resp.status_code == 404
