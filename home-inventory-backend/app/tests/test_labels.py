import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_label(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/labels", headers=auth_headers, json={
        "name": "Fragile",
        "color_bg": "#FEE2E2",
        "color_text": "#991B1B",
    })
    assert resp.status_code == 201
    assert resp.json()["name"] == "Fragile"


@pytest.mark.asyncio
async def test_list_labels(client: AsyncClient, auth_headers):
    await client.post("/api/v1/labels", headers=auth_headers, json={"name": "High Value", "color_bg": "#FEF3C7", "color_text": "#92400E"})
    resp = await client.get("/api/v1/labels", headers=auth_headers)
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_update_label(client: AsyncClient, auth_headers):
    label = (await client.post("/api/v1/labels", headers=auth_headers, json={"name": "Old Name", "color_bg": "#E0E7FF", "color_text": "#3730A3"})).json()
    resp = await client.patch(f"/api/v1/labels/{label['id']}", headers=auth_headers, json={"name": "New Name"})
    assert resp.status_code == 200
    assert resp.json()["name"] == "New Name"


@pytest.mark.asyncio
async def test_delete_label(client: AsyncClient, auth_headers):
    label = (await client.post("/api/v1/labels", headers=auth_headers, json={"name": "Delete Me", "color_bg": "#F3F4F6", "color_text": "#374151"})).json()
    resp = await client.delete(f"/api/v1/labels/{label['id']}", headers=auth_headers)
    assert resp.status_code == 204
