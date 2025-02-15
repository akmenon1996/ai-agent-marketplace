import pytest
from fastapi import status
from unittest.mock import patch, MagicMock
from sqlalchemy.orm import Session

def get_customer_auth_header(client, test_db):
    # Register a test user
    response = client.post(
        "/users/register",
        json={
            "username": "testcustomer",
            "email": "testcustomer@example.com",
            "password": "testpassword123",
            "is_developer": False
        }
    )
    
    # Login to get token
    response = client.post(
        "/token",
        data={
            "username": "testcustomer",
            "password": "testpassword123"
        }
    )
    
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

@patch("stripe.PaymentIntent.create")
def test_purchase_tokens(mock_stripe, client, test_db):
    mock_stripe.return_value = MagicMock(
        id="test_payment_intent",
        client_secret="test_client_secret"
    )
    
    headers = get_customer_auth_header(client, test_db)
    
    response = client.post(
        "/marketplace/purchase-tokens",
        headers=headers,
        json={
            "amount": 100,  # Purchase $100 worth of tokens
            "currency": "usd"
        }
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "client_secret" in data
    assert "payment_intent_id" in data

def test_get_token_balance(client, test_db):
    headers = get_customer_auth_header(client, test_db)
    
    response = client.get("/marketplace/token-balance", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "token_balance" in data
    assert isinstance(data["token_balance"], float)

def test_get_agent_usage_history(client, test_db):
    headers = get_customer_auth_header(client, test_db)
    
    response = client.get("/marketplace/usage-history", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert isinstance(data, list)
    # Even if empty, should return a list
    assert isinstance(data, list)

def test_get_developer_earnings(client, test_db):
    # First create a developer account
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
    headers = {"Authorization": f"Bearer {response.json()['access_token']}"}
    
    response = client.get("/marketplace/developer-earnings", headers=headers)
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert "total_earnings" in data
    assert "earnings_by_agent" in data
