import pytest
from httpx import AsyncClient


@pytest.mark.asyncio
async def test_register_success(client: AsyncClient):
    resp = await client.post("/api/v1/users/register", json={
        "email": "new@example.com",
        "username": "newuser",
        "password": "password123",
    })
    assert resp.status_code == 201
    data = resp.json()
    assert "token" in data
    assert "refresh_token" in data


@pytest.mark.asyncio
async def test_register_duplicate_email(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/users/register", json={
        "email": "test@example.com",
        "username": "anotheruser",
        "password": "password123",
    })
    assert resp.status_code == 409


@pytest.mark.asyncio
async def test_login_success(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/users/login", json={
        "username": "test@example.com",
        "password": "testpassword123",
    })
    assert resp.status_code == 200
    assert "token" in resp.json()


@pytest.mark.asyncio
async def test_login_wrong_password(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/users/login", json={
        "username": "test@example.com",
        "password": "wrongpassword",
    })
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_login_by_username(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/users/login", json={
        "username": "testuser",
        "password": "testpassword123",
    })
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_get_me_authenticated(client: AsyncClient, auth_headers):
    resp = await client.get("/api/v1/users/me", headers=auth_headers)
    assert resp.status_code == 200
    assert resp.json()["email"] == "test@example.com"


@pytest.mark.asyncio
async def test_get_me_unauthenticated(client: AsyncClient):
    resp = await client.get("/api/v1/users/me")
    assert resp.status_code == 401


@pytest.mark.asyncio
async def test_token_refresh(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/refresh", json={
        "refresh_token": registered_user["refresh_token"]
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "token" in data
    assert "refresh_token" in data
    assert data["refresh_token"] != registered_user["refresh_token"]


@pytest.mark.asyncio
async def test_logout(client: AsyncClient, registered_user):
    resp = await client.post("/api/v1/auth/logout", json={
        "refresh_token": registered_user["refresh_token"]
    })
    assert resp.status_code == 200


@pytest.mark.asyncio
async def test_register_invalid_email(client: AsyncClient):
    resp = await client.post("/api/v1/users/register", json={
        "email": "not-an-email",
        "username": "validuser",
        "password": "password123",
    })
    assert resp.status_code == 422


@pytest.mark.asyncio
async def test_register_weak_password(client: AsyncClient):
    resp = await client.post("/api/v1/users/register", json={
        "email": "weak@example.com",
        "username": "weakuser",
        "password": "short",
    })
    assert resp.status_code == 422
