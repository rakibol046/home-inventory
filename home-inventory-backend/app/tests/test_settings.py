import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_get_settings(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/settings", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.json()
    assert "currency" in data
    assert "timezone" in data
    assert "warranty_alert_days" in data


@pytest.mark.asyncio
async def test_update_settings(client: AsyncClient, auth_headers):
    payload = {"currency": "EUR", "timezone": "Europe/London", "warranty_alert_days": 14}
    resp = await client.patch("/api/v1/settings", headers=auth_headers, json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["currency"] == "EUR"
    assert data["timezone"] == "Europe/London"
    assert data["warranty_alert_days"] == 14


@pytest.mark.asyncio
async def test_settings_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/settings")
    assert resp.status_code == 401
