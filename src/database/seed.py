from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database.models import Base, Agent, User
from config import get_settings
from auth.security import get_password_hash

def seed_database():
    # Create database engine
    settings = get_settings()
    engine = create_engine(settings.DATABASE_URL)
    
    # Create tables
    Base.metadata.drop_all(bind=engine)  # Drop all tables first
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Create a developer user
        developer = User(
            username="admin",
            email="admin@example.com",
            hashed_password=get_password_hash("admin123"),
            is_developer=True,
            token_balance=1000.0
        )
        db.add(developer)
        db.commit()
        db.refresh(developer)
        developer_id = developer.id

        # Create agents if they don't exist
        agents = [
            {
                'name': 'Interview Prep Assistant',
                'description': 'AI-powered interview preparation assistant that helps you practice for job interviews with personalized questions and feedback.',
                'price': 10.0,
                'developer_id': developer_id,
                'is_active': True
            },
            {
                'name': 'Code Reviewer',
                'description': 'Automated code review assistant that analyzes your code for best practices, potential bugs, and suggests improvements.',
                'price': 15.0,
                'developer_id': developer_id,
                'is_active': True
            },
            {
                'name': 'Resume Reviewer',
                'description': 'Professional resume analysis tool that provides detailed feedback and suggestions to improve your resume.',
                'price': 10.0,
                'developer_id': developer_id,
                'is_active': True
            },
            {
                'name': 'Technical Troubleshooter',
                'description': 'AI assistant that helps diagnose and solve technical problems with step-by-step guidance.',
                'price': 12.0,
                'developer_id': developer_id,
                'is_active': True
            },
            {
                'name': 'Writing Assistant',
                'description': 'Advanced writing aid that helps improve your content with suggestions for clarity, tone, and style.',
                'price': 8.0,
                'developer_id': developer_id,
                'is_active': True
            }
        ]
        
        # Add agents to database
        for agent_data in agents:
            # Check if agent already exists
            existing_agent = db.query(Agent).filter(Agent.name == agent_data['name']).first()
            if not existing_agent:
                agent = Agent(**agent_data)
                db.add(agent)
        
        # Commit changes
        db.commit()
        print("Database seeded successfully!")
        
    except Exception as e:
        print(f"Error seeding database: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
