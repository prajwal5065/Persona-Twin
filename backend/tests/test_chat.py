import pytest

@pytest.mark.asyncio
async def test_chat_success(client, auth_headers, test_user):
    # Assuming test_user has id 1
    response = await client.post(
        "/chat", 
        json={"query": "Hello", "user_id": test_user.id}, 
        headers=auth_headers
    )
    assert response.status_code == 200
    assert "response" in response.json()
    assert response.json()["response"] == "mocked response"

@pytest.mark.asyncio
async def test_chat_auth_failure(client, test_user):
    response = await client.post(
        "/chat", 
        json={"query": "Hello", "user_id": test_user.id}
    )
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_chat_validation_failure(client, auth_headers):
    response = await client.post(
        "/chat", 
        json={"wrong_payload": "Hello"}, 
        headers=auth_headers
    )
    assert response.status_code == 422
