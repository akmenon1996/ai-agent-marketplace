from src.database.models import Base, User
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.config import get_settings
from src.auth.security import get_password_hash

def create_test_user():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()

    # Create test user
    test_user = User(
        username='testuser',
        email='test@example.com',
        hashed_password=get_password_hash('password123'),
        is_active=True,
        is_developer=True,
        token_balance=100.0
    )

    db.add(test_user)
    db.commit()
    db.close()

if __name__ == "__main__":
    create_test_user()
    print("Test user created successfully")
