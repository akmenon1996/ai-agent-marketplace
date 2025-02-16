import sys
import os
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the Python path
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(parent_dir)
sys.path.append(parent_dir)

from database.models import Base

# Initialize database connection
DATABASE_URL = f"sqlite:///{os.path.join(project_root, 'app.db')}"
print(f"Using database at: {os.path.join(project_root, 'app.db')}")
engine = create_engine(DATABASE_URL)

def migrate():
    """Create tables and add the summary column."""
    try:
        # Add the summary column
        with engine.connect() as conn:
            try:
                conn.execute(text("ALTER TABLE agent_invocations ADD COLUMN summary TEXT;"))
                conn.commit()
                print("Successfully added summary column")
            except Exception as e:
                if "duplicate column name" not in str(e).lower():
                    print(f"Error adding summary column: {str(e)}")
                else:
                    print("Summary column already exists")
    except Exception as e:
        print(f"Error during migration: {str(e)}")

if __name__ == "__main__":
    migrate()
