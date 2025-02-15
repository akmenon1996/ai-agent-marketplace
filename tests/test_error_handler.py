import pytest
from fastapi import FastAPI, HTTPException, Depends
from fastapi.testclient import TestClient
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
from jose.exceptions import JWTError
from openai import OpenAIError
from stripe.error import StripeError

from src.middleware.error_handler import error_handler_middleware
from src.database.models import Base

# Test database setup
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

app = FastAPI()
app.middleware("http")(error_handler_middleware)

# Dependency
def get_test_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/test-database-error")
async def test_database_error(db: Session = Depends(get_test_db)):
    raise SQLAlchemyError("Test database error")

@app.get("/test-auth-error")
async def test_auth_error(db: Session = Depends(get_test_db)):
    raise JWTError("Test auth error")

@app.get("/test-openai-error")
async def test_openai_error(db: Session = Depends(get_test_db)):
    raise OpenAIError("Test OpenAI error")

@app.get("/test-stripe-error")
async def test_stripe_error(db: Session = Depends(get_test_db)):
    raise StripeError("Test Stripe error")

@app.get("/test-generic-error")
async def test_generic_error(db: Session = Depends(get_test_db)):
    raise Exception("Test generic error")

@pytest.fixture(scope="function")
def test_db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db):
    app.dependency_overrides[get_test_db] = lambda: test_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

def test_database_error(client):
    response = client.get("/test-database-error")
    assert response.status_code == 500
    assert response.json() == {
        "detail": "Database error occurred",
        "type": "database_error"
    }

def test_auth_error(client):
    response = client.get("/test-auth-error")
    assert response.status_code == 401
    assert response.json() == {
        "detail": "Invalid authentication credentials",
        "type": "auth_error"
    }

def test_openai_error(client):
    response = client.get("/test-openai-error")
    assert response.status_code == 503
    assert response.json() == {
        "detail": "AI service error",
        "type": "ai_error"
    }

def test_stripe_error(client):
    response = client.get("/test-stripe-error")
    assert response.status_code == 503
    assert response.json() == {
        "detail": "Payment service error",
        "type": "payment_error"
    }

def test_generic_error(client):
    response = client.get("/test-generic-error")
    assert response.status_code == 500
    assert response.json() == {
        "detail": "An unexpected error occurred",
        "type": "server_error"
    }
