import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import StaticPool
from typing import Generator

from src.database.models import Base
from src.config import get_settings, Settings
from src.auth.security import get_password_hash

def get_test_settings() -> Settings:
    return Settings(
        DATABASE_URL="sqlite:///:memory:",
        SECRET_KEY="test_secret_key",
        OPENAI_API_KEY="test_openai_key",
        STRIPE_SECRET_KEY="test_stripe_key",
        STRIPE_PUBLISHABLE_KEY="test_stripe_publishable_key"
    )

@pytest.fixture(scope="function")
def test_db() -> Generator[Session, None, None]:
    # Create an in-memory SQLite database for testing
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    Base.metadata.create_all(bind=engine)
    
    # Create a new session for testing
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(test_db: Session) -> Generator[TestClient, None, None]:
    # Import app here to avoid circular imports
    from src.main import app, get_db, get_current_active_user
    from src.database.models import User
    
    # Clear any existing users
    test_db.query(User).delete()
    test_db.commit()
    
    def override_get_db():
        try:
            yield test_db
        finally:
            pass  # Don't close here as it's handled by the test_db fixture
    
    app.dependency_overrides[get_db] = override_get_db
    app.dependency_overrides[get_settings] = get_test_settings
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()
