import pytest
from fastapi import status
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session

def get_auth_header(client, db: Session):
    # Register and login a developer
    client.post(
        "/users/register",
        json={
            "username": "testdev",
            "email": "testdev@example.com",
            "password": "testpassword123",
            "is_developer": True
        }
    )
    
    response = client.post(
        "/token",
        data={
            "username": "testdev",
            "password": "testpassword123"
        }
    )
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_create_agent(client, test_db):
    headers = get_auth_header(client, test_db)
    
    response = client.post(
        "/agents/create",
        headers=headers,
        json={
            "name": "Test Agent",
            "description": "A test agent",
            "price_per_token": 0.0001
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Test Agent"
    assert data["price_per_token"] == 0.0001

def test_list_agents(client, test_db):
    headers = get_auth_header(client, test_db)
    
    # Create an agent first
    client.post(
        "/agents/create",
        headers=headers,
        json={
            "name": "Test Agent",
            "description": "A test agent",
            "price_per_token": 0.0001
        }
    )
    
    response = client.get("/agents", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) > 0
    assert data[0]["name"] == "Test Agent"

@patch("src.agents.resume_reviewer.openai.ChatCompletion.create")
def test_invoke_resume_reviewer(mock_openai, client, test_db):
    mock_openai.return_value = MagicMock(
        choices=[MagicMock(message=MagicMock(content="Test review"))],
        usage=MagicMock(prompt_tokens=10, completion_tokens=20)
    )
    
    headers = get_auth_header(client, test_db)
    
    # Create the agent first
    response = client.post(
        "/agents/create",
        headers=headers,
        json={
            "name": "Resume Reviewer",
            "description": "A resume review agent",
            "price_per_token": 0.0001
        }
    )
    agent_id = response.json()["id"]
    
    # Purchase tokens
    client.post(
        "/agents/purchase",
        headers=headers,
        json={
            "agent_id": agent_id,
            "tokens_purchased": 1000
        }
    )
    
    response = client.post(
        f"/agents/invoke/{agent_id}",
        headers=headers,
        json={
            "resume_text": "Test resume content"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "output" in data
    assert "tokens_used" in data
    assert data["tokens_used"] > 0
    assert data["status"] == "completed"

def test_insufficient_tokens(client, test_db):
    headers = get_auth_header(client, test_db)
    
    # Create the agent first
    response = client.post(
        "/agents/create",
        headers=headers,
        json={
            "name": "Resume Reviewer",
            "description": "A resume review agent",
            "price_per_token": 0.0001
        }
    )
    agent_id = response.json()["id"]
    
    # Try to invoke without purchasing tokens
    response = client.post(
        f"/agents/invoke/{agent_id}",
        headers=headers,
        json={
            "resume_text": "Test resume content"
        }
    )
    assert response.status_code == status.HTTP_402_PAYMENT_REQUIRED
