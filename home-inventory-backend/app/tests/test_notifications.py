import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_list_notifications_empty(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/notifications", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert data["total"] == 0
    assert data["items"] == []


@pytest.mark.asyncio
async def test_list_notifications_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/notifications")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_mark_all_notifications_read(client: AsyncClient, auth_headers):
    resp = await client.post("/api/v1/notifications/read-all", headers=auth_headers)
    assert resp.status_code == 200
