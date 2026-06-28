import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_create_category(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/categories", headers=auth_headers, json={
        "name": "Electronics",
        "color": "#DBEAFE",
        "icon": "Laptop",
    })
    assert resp.status_code == 201
    assert resp.json()["name"] == "Electronics"


@pytest.mark.asyncio
async def test_list_categories(client: AsyncClient, auth_headers):
    await client.post("/api/v1/categories", headers=auth_headers, json={"name": "Furniture"})
    resp = await client.get("/api/v1/categories", headers=auth_headers)
    assert resp.status_code == 200
    names = [c["name"] for c in resp.json()]
    assert "Furniture" in names


@pytest.mark.asyncio
async def test_delete_category(client: AsyncClient, auth_headers):
    cat = (await client.post("/api/v1/categories", headers=auth_headers, json={"name": "Temp"})).json()
    resp = await client.delete(f"/api/v1/categories/{cat['id']}", headers=auth_headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_categories_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/categories")
    assert resp.status_code == 401
