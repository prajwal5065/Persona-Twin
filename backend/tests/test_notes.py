import pytest

@pytest.mark.asyncio
async def test_create_note_success(client, auth_headers):
    # Depending on schemas, there may be "user_id" needed if it doesn't default to current_user
    response = await client.post("/add-note", json={"content": "Test note", "user_id": 1}, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["content"] == "Test note"

@pytest.mark.asyncio
async def test_create_note_auth_failure(client):
    response = await client.post("/add-note", json={"content": "Test note", "user_id": 1})
    assert response.status_code == 401

@pytest.mark.asyncio
async def test_create_note_validation_failure(client, auth_headers):
    response = await client.post("/add-note", json={"wrong_field": "Test note"}, headers=auth_headers)
    assert response.status_code == 422

@pytest.mark.asyncio
async def test_get_notes_success(client, auth_headers):
    # Depending on auth
    response = await client.get("/notes", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)
