import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_items_empty(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/items", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_create_item(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/items", headers=auth_headers, json={
        "name": "Sony Headphones",
        "brand": "Sony",
        "model_number": "WH-1000XM4",
        "quantity": 1,
        "condition": "Excellent",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Sony Headphones"
    assert data["brand"] == "Sony"
    return data


@pytest.mark.asyncio
async def test_create_item_unauthenticated(client: AsyncClient):
    resp = await client.post("/api/v1/items", json={"name": "Test"})
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_get_item(client: AsyncClient, auth_headers):
    # Create first
    create_resp = await client.post("/api/v1/items", headers=auth_headers, json={"name": "Laptop", "quantity": 1})
    item_id = create_resp.json()["id"]

    resp = await client.get(f"/api/v1/items/{item_id}", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["id"] == item_id


@pytest.mark.asyncio
async def test_get_item_not_found(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/items/00000000-0000-0000-0000-000000000000", headers=auth_headers)
    assert resp.status_code == 404


@pytest.mark.asyncio
async def test_update_item(client: AsyncClient, auth_headers):
    create_resp = await client.post("/api/v1/items", headers=auth_headers, json={"name": "Camera", "quantity": 1})
    item_id = create_resp.json()["id"]

    resp = await client.patch(f"/api/v1/items/{item_id}", headers=auth_headers, json={"quantity": 2, "notes": "Updated"})
    assert resp.status_code == 200
    assert resp.json()["quantity"] == 2


@pytest.mark.asyncio
async def test_delete_item(client: AsyncClient, auth_headers):
    create_resp = await client.post("/api/v1/items", headers=auth_headers, json={"name": "Delete Me", "quantity": 1})
    item_id = create_resp.json()["id"]

    del_resp = await client.delete(f"/api/v1/items/{item_id}", headers=auth_headers)
    assert del_resp.status_code == 204

    get_resp = await client.get(f"/api/v1/items/{item_id}", headers=auth_headers)
    assert get_resp.status_code == 404


@pytest.mark.asyncio
async def test_search_items(client: AsyncClient, auth_headers):
    await client.post("/api/v1/items", headers=auth_headers, json={"name": "Apple MacBook", "quantity": 1})
    await client.post("/api/v1/items", headers=auth_headers, json={"name": "Dell Monitor", "quantity": 1})

    resp = await client.get("/api/v1/items?search=MacBook", headers=auth_headers)
    assert resp.status_code == 200
    items = resp.json()["items"]
    assert all("macbook" in i["name"].lower() for i in items)


@pytest.mark.asyncio
async def test_item_isolation(client: AsyncClient):
    # Register user 1
    r1 = await client.post("/api/v1/users/register", json={
        "email": "user1@example.com",
        "username": "user1",
        "password": "password123",
    })
    assert r1.status_code == 201
    headers1 = {"Authorization": f"Bearer {r1.json()['token']}"}

    # Register user 2
    r2 = await client.post("/api/v1/users/register", json={
        "email": "user2@example.com",
        "username": "user2",
        "password": "password123",
    })
    assert r2.status_code == 201
    headers2 = {"Authorization": f"Bearer {r2.json()['token']}"}

    # User 1 creates item
    item_resp = await client.post("/api/v1/items", headers=headers1, json={"name": "Private Item", "quantity": 1})
    assert item_resp.status_code == 201
    item_id = item_resp.json()["id"]

    # User 2 cannot access user 1's item
    resp = await client.get(f"/api/v1/items/{item_id}", headers=headers2)
    assert resp.status_code == 404
