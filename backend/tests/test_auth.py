import pytest

@pytest.mark.asyncio
async def test_register_success(client):
    response = await client.post("/auth/register", json={
        "email": "newuser@example.com",
        "password": "newpassword123"
    })
    assert response.status_code == 201
    assert response.json()["email"] == "newuser@example.com"

@pytest.mark.asyncio
async def test_register_validation_failure(client):
    response = await client.post("/auth/register", json={"email": "not-an-email"})
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_login_success(client, test_user):
    response = await client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "testpassword123"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

@pytest.mark.asyncio
async def test_login_invalid_credentials(client, test_user):
    response = await client.post("/auth/login", data={
        "username": "test@example.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
