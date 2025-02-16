from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User
from config import get_settings
from auth.security import get_password_hash, verify_password

def check_password():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Try to find the admin user
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"Found user: {user.username}")
            print(f"Stored hash: {user.hashed_password}")
            
            # Test password verification
            test_password = "admin123"
            is_valid = verify_password(test_password, user.hashed_password)
            print(f"Password 'admin123' verification result: {is_valid}")
            
            # Generate a new hash for comparison
            new_hash = get_password_hash(test_password)
            print(f"New hash for 'admin123': {new_hash}")
        else:
            print("Admin user not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_password()
