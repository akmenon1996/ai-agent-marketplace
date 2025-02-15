import pytest
from fastapi import status
from sqlalchemy.orm import Session

def test_register_user(client, test_db):
    response = client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "is_developer": False
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@example.com"
    assert "token_balance" in data
    assert "is_developer" in data

def test_login_user(client, test_db):
    # First register a user
    client.post(
        "/users/register",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "testpassword123",
            "is_developer": False
        }
    )
    
    # Then try to login
    response = client.post(
        "/token",
        data={
            "username": "testuser",
            "password": "testpassword123"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_invalid_login(client, test_db):
    response = client.post(
        "/token",
        data={
            "username": "nonexistent",
            "password": "wrongpassword"
        }
    )
    assert response.status_code == status.HTTP_401_UNAUTHORIZED
