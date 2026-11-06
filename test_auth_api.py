import pytest
from httpx import AsyncClient
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text


@pytest.mark.asyncio
async def test_register_and_login_flow(client: AsyncClient, db_session: AsyncSession):
    test_email = "buyer@example.com"
    # Ensure clean state
    await db_session.execute(text(f"DELETE FROM users WHERE email = '{test_email}'"))
    await db_session.commit()

    # 1. Register Buyer
    reg_res = await client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Test Buyer",
        "phone_number": "+1234567890"
    })
    assert reg_res.status_code == 201
    data = reg_res.json()
    assert data["email"] == test_email
    assert data["full_name"] == "Test Buyer"
    assert data["role"] == "buyer"
    assert "id" in data
    assert "hashed_password" not in data

    # 2. Duplicate registration check
    dup_res = await client.post("/api/v1/auth/register", json={
        "email": test_email,
        "password": "Password123!",
        "full_name": "Test Buyer"
    })
    assert dup_res.status_code == 400
    assert "already exists" in dup_res.json()["detail"].lower()

    # 3. Login with form-data / JSON
    login_res = await client.post("/api/v1/auth/login", json={
        "email": test_email,
        "password": "Password123!"
    })
    assert login_res.status_code == 200
    token_data = login_res.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    assert token_data["role"] == "buyer"
    token = token_data["access_token"]

    # 4. Verify Identity
    me_res = await client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    me_data = me_res.json()
    assert me_data["email"] == test_email
    assert me_data["role"] == "buyer"
    assert me_data["full_name"] == "Test Buyer"


@pytest.mark.asyncio
async def test_login_invalid_password(client: AsyncClient, db_session: AsyncSession):
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "buyer@example.com",
        "password": "WrongPassword999!"
    })
    assert login_res.status_code == 401
    assert "invalid email or password" in login_res.json()["detail"].lower()


@pytest.mark.asyncio
async def test_login_nonexistent_user(client: AsyncClient):
    login_res = await client.post("/api/v1/auth/login", json={
        "email": "nonexistent_user_12345@example.com",
        "password": "Password123!"
    })
    assert login_res.status_code == 401


@pytest.mark.asyncio
async def test_me_unauthorized(client: AsyncClient):
    # Missing token
    res1 = await client.get("/api/v1/auth/me")
    assert res1.status_code == 401

    # Malformed token
    res2 = await client.get("/api/v1/auth/me", headers={"Authorization": "Bearer invalid_garbage_token"})
    assert res2.status_code == 401


@pytest.mark.asyncio
async def test_register_validation_errors(client: AsyncClient):
    # Invalid email format
    res = await client.post("/api/v1/auth/register", json={
        "email": "not-an-email",
        "password": "Short",
        "full_name": "A"
    })
    assert res.status_code == 422


@pytest.mark.asyncio
async def test_health_check(client: AsyncClient):
    res = await client.get("/health")
    assert res.status_code == 200
    assert res.json()["status"] == "healthy"
