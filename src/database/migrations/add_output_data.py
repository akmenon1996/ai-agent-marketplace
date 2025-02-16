from sqlalchemy import create_engine, text

def migrate():
    # Create engine
    engine = create_engine('sqlite:///app.db')
    
    # Add output_data column to agent_invocations table
    with engine.connect() as conn:
        conn.execute(text('ALTER TABLE agent_invocations ADD COLUMN output_data TEXT;'))
        conn.commit()

if __name__ == '__main__':
    migrate()
