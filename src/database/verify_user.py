from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from config import get_settings

def verify_user():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Try to find the admin user
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"Found user: {user.username}")
            print(f"Email: {user.email}")
            print(f"Is developer: {user.is_developer}")
            print(f"Token balance: {user.token_balance}")
        else:
            print("Admin user not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_user()
