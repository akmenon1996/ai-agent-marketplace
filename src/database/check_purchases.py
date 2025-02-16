from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import User, Agent, AgentPurchase
from config import get_settings

def check_purchases():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Get the admin user
        user = db.query(User).filter(User.username == "admin").first()
        if user:
            print(f"Checking purchases for user: {user.username}")
            purchases = db.query(AgentPurchase).filter(AgentPurchase.user_id == user.id).all()
            if purchases:
                print("Found purchases:")
                for purchase in purchases:
                    agent = db.query(Agent).filter(Agent.id == purchase.agent_id).first()
                    print(f"Agent ID: {purchase.agent_id}")
                    print(f"Agent Name: {agent.name if agent else 'Unknown'}")
                    print(f"Purchase Price: {purchase.purchase_price}")
                    print(f"Purchase Date: {purchase.purchase_date}")
                    print("---")
            else:
                print("No purchases found")
        else:
            print("Admin user not found")
    except Exception as e:
        print(f"Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_purchases()
