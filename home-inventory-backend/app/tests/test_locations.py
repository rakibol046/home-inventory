import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_rooms_empty(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/rooms", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json() == []


@pytest.mark.asyncio
async def test_create_room(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/rooms", headers=auth_headers, json={"name": "Living Room"})
    assert resp.status_code == 201
    data = resp.json()
    assert data["name"] == "Living Room"
    return data


@pytest.mark.asyncio
async def test_create_and_list_location(client: AsyncClient, auth_headers):
    room = (await client.post("/api/v1/rooms", headers=auth_headers, json={"name": "Garage"})).json()

    loc_resp = await client.post("/api/v1/locations", headers=auth_headers, json={
        "room_id": room["id"],
        "name": "Tool Cabinet",
    })
    assert loc_resp.status_code == 201
    loc = loc_resp.json()
    assert loc["name"] == "Tool Cabinet"
    assert loc["room"]["name"] == "Garage"

    list_resp = await client.get("/api/v1/locations", headers=auth_headers)
    assert list_resp.status_code == 200
    names = [l["name"] for l in list_resp.json()]
    assert "Tool Cabinet" in names


@pytest.mark.asyncio
async def test_delete_room(client: AsyncClient, auth_headers):
    room = (await client.post("/api/v1/rooms", headers=auth_headers, json={"name": "Delete Room"})).json()
    resp = await client.delete(f"/api/v1/rooms/{room['id']}", headers=auth_headers)
    assert resp.status_code == 204


@pytest.mark.asyncio
async def test_location_requires_valid_room(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/locations", headers=auth_headers, json={
        "room_id": "00000000-0000-0000-0000-000000000000",
        "name": "Orphan Location",
    })
    assert resp.status_code == 404
