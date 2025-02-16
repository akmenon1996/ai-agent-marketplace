import os
import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from src.database.models import Agent, Base
from src.config import get_settings

def main():
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    Session = sessionmaker(bind=engine)
    session = Session()

    agents = session.query(Agent).all()
    print("\nAll Agents in Database:")
    print("----------------------")
    for agent in agents:
        print(f"ID: {agent.id}")
        print(f"Name: {agent.name}")
        print(f"Description: {agent.description}")
        print(f"Price: {agent.price}")
        print(f"Created At: {agent.created_at}")
        print(f"Updated At: {agent.updated_at}")
        print("----------------------")

if __name__ == "__main__":
    main()
