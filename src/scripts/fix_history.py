import sys
import os
import json
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add the parent directory to the Python path so we can import our modules
parent_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
project_root = os.path.dirname(parent_dir)
sys.path.append(parent_dir)

from database.models import Base, AgentInvocation

# Initialize database connection
DATABASE_URL = f"sqlite:///{os.path.join(project_root, 'app.db')}"
print(f"Using database at: {os.path.join(project_root, 'app.db')}")
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def clean_json_string(s: str) -> str:
    """Clean and parse a JSON string that might be double-stringified."""
    s = s.strip()
    if not s:
        return "{}"
        
    # Remove any leading/trailing quotes and unescape
    if s.startswith('"') and s.endswith('"'):
        s = s[1:-1]
    s = s.replace('\\"', '"')
    
    try:
        # Try parsing as JSON
        parsed = json.loads(s)
        return json.dumps(parsed)
    except:
        try:
            # If it's a Python string representation, try eval
            parsed = eval(s)
            if isinstance(parsed, (dict, list)):
                return json.dumps(parsed)
            return json.dumps({"text": str(parsed)})
        except:
            # If all else fails, wrap as text
            return json.dumps({"text": s})

def extract_text_from_json(json_str: str) -> str:
    """Extract meaningful text from a JSON string."""
    try:
        data = json.loads(json_str)
        if isinstance(data, str):
            return data
        
        if isinstance(data, dict):
            # Check common fields
            for field in ['output_text', 'input_text', 'text', 'topic']:
                if field in data:
                    return data[field]
            
            # Check nested structures
            if 'interview_prep' in data and 'topic' in data['interview_prep']:
                return data['interview_prep']['topic']
            if 'code_review' in data and 'code' in data['code_review']:
                return data['code_review']['code']
        
        return json.dumps(data)
    except:
        return json_str

def generate_summary(input_json: str, output_json: str) -> str:
    """Generate a summary from input and output JSON."""
    input_text = extract_text_from_json(input_json)
    output_text = extract_text_from_json(output_json)
    
    summary = ""
    if input_text:
        summary += input_text[:150]
        if len(input_text) > 150:
            summary += "..."
    
    if output_text:
        if summary:
            summary += "\nResponse: "
        summary += output_text[:200]
        if len(output_text) > 200:
            summary += "..."
    
    return summary or "No content available"

def fix_invocation(db, invocation):
    """Fix a single invocation's data format."""
    try:
        # Clean and parse input data
        input_data = clean_json_string(invocation.input_data)
        output_data = clean_json_string(invocation.output_data or "{}")
        
        # Update the invocation with cleaned data
        invocation.input_data = input_data
        invocation.output_data = output_data
        
        # Generate and store summary
        invocation.summary = generate_summary(input_data, output_data)
        
        return True
    except Exception as e:
        print(f"Error fixing invocation {invocation.id}: {str(e)}")
        return False

def main():
    db = SessionLocal()
    try:
        # Get all invocations
        invocations = db.query(AgentInvocation).all()
        print(f"Found {len(invocations)} invocations to process")
        
        success_count = 0
        for i, invocation in enumerate(invocations):
            print(f"Processing invocation {i+1}/{len(invocations)} (ID: {invocation.id})")
            if fix_invocation(db, invocation):
                success_count += 1
                
        # Commit all changes
        db.commit()
        print(f"\nSuccessfully processed {success_count}/{len(invocations)} invocations")
        
    except Exception as e:
        print(f"Error: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()
