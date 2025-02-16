from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional
from jose import jwt, JWTError

from src.database.models import Base, User, Agent, AgentPurchase, AgentInvocation
from src.database.schemas import (
    UserCreate, UserResponse, 
    AgentCreate, AgentResponse,
    TokenResponse, TokenData,
    PurchaseCreate, AgentPurchaseResponse,
    InvocationCreate, InvocationResponse
)
from src.config import get_settings
from src.auth.security import (
    get_password_hash,
    verify_password,
    create_access_token,
    get_current_user,
    oauth2_scheme
)

from src.agents.resume_reviewer import ResumeReviewerAgent
from src.agents.code_reviewer import CodeReviewAgent
from src.agents.interview_prep import InterviewPrepAgent
from src.agents.writing_assistant import WritingAssistantAgent
from src.agents.technical_troubleshooter import TechnicalTroubleshooterAgent

from pydantic import BaseModel

app = FastAPI(title="AI Agent Marketplace")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React app origin
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database setup
settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base.metadata.create_all(bind=engine)

# Dependency to get database session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Dependency to get current user
async def get_current_user(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme)
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
        token_data = TokenData(username=username)
    except JWTError:
        raise credentials_exception
    user = db.query(User).filter(User.username == token_data.username).first()
    if user is None:
        raise credentials_exception
    return user

class TokenPurchaseRequest(BaseModel):
    amount: float

@app.post("/users/register", response_model=UserResponse)
async def register_user(user: UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.username == user.username).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Username already registered")
    
    hashed_password = get_password_hash(user.password)
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        is_developer=user.is_developer,
        token_balance=0.0,
        is_active=True
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return UserResponse.model_validate(db_user)

@app.post("/token", response_model=TokenResponse)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(), 
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user.username}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/agents/create", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate, 
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if not current_user.is_developer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can create agents"
        )
    
    db_agent = Agent(
        name=agent.name,
        description=agent.description,
        developer_id=current_user.id,
        price=agent.price,
        is_active=True
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return AgentResponse.model_validate(db_agent)

@app.get("/agents", response_model=List[Dict[str, Any]])
async def list_agents(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """List all available agents"""
    agents = db.query(Agent).filter(Agent.is_active == True).all()
    return [{
        "id": agent.id,
        "name": agent.name,
        "description": agent.description,
        "price": agent.price,
        "developer_id": agent.developer_id,
        "is_active": agent.is_active,
        "created_at": agent.created_at.isoformat()
    } for agent in agents]

@app.get("/agents/{agent_id}", response_model=AgentResponse)
async def get_agent(
    agent_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if user has purchased this agent
    purchase = db.query(AgentPurchase).filter(
        AgentPurchase.user_id == current_user.id,
        AgentPurchase.agent_id == agent_id
    ).first()
    
    agent_data = AgentResponse.model_validate(agent)
    agent_data.is_purchased = purchase is not None
    return agent_data

@app.post("/agents/purchase", response_model=AgentPurchaseResponse)
async def purchase_agent(
    purchase: PurchaseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    agent = db.query(Agent).filter(Agent.id == purchase.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    if current_user.token_balance < purchase.purchase_price:
        raise HTTPException(status_code=400, detail="Insufficient token balance")
    
    current_user.token_balance -= purchase.purchase_price
    
    db_purchase = AgentPurchase(
        user_id=current_user.id,
        agent_id=purchase.agent_id,
        purchase_price=purchase.purchase_price
    )
    
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    
    return AgentPurchaseResponse(
        agent_id=purchase.agent_id,
        purchase_id=db_purchase.id,
        purchase_price=purchase.purchase_price,
        remaining_balance=current_user.token_balance
    )

@app.post("/agents/invoke/{agent_id}")
async def invoke_agent(
    agent_id: int,
    input_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    print(f"Invoking agent {agent_id} with input: {input_data}")
    agent = db.query(Agent).filter(Agent.id == agent_id).first()
    if not agent:
        print(f"Agent {agent_id} not found in database")
        raise HTTPException(status_code=404, detail="Agent not found")
    
    print(f"Found agent in database: {agent.name}")
    # Get the agent instance from available agents
    agent_key = AGENT_NAME_TO_KEY.get(agent.name)
    print(f"Looking up agent with key: {agent_key}")
    print(f"Available agents: {list(AVAILABLE_AGENTS.keys())}")
    
    if not agent_key:
        print(f"No mapping found for agent name: {agent.name}")
        raise HTTPException(status_code=404, detail=f"No implementation mapping for agent: {agent.name}")
    
    agent_instance = AVAILABLE_AGENTS.get(agent_key)
    if not agent_instance:
        print(f"No implementation found for agent key: {agent_key}")
        raise HTTPException(status_code=404, detail="Agent implementation not found")
    
    try:
        print(f"Processing request with agent instance: {type(agent_instance).__name__}")
        result = await agent_instance.process_request(input_data)
        print(f"Got result from agent: {result}")
        
        # Record the invocation
        db_invocation = AgentInvocation(
            user_id=current_user.id,
            agent_id=agent_id,
            input_data=str(input_data),
            output_data=str(result),
            tokens_used=result.get("token_usage", {}).get("total_tokens", 0)
        )
        db.add(db_invocation)
        
        # Update user's token balance
        cost = result.get("cost", 0)
        if current_user.token_balance < cost:
            raise HTTPException(status_code=400, detail="Insufficient token balance")
        current_user.token_balance -= cost
        
        db.commit()
        return result
        
    except Exception as e:
        print(f"Error processing request: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/tokens/purchase")
async def purchase_tokens(
    request: TokenPurchaseRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    try:
        # In a real app, this would integrate with Stripe or another payment processor
        # For now, we'll just add the tokens directly
        current_user.token_balance += request.amount
        db.commit()
        
        return {
            "status": "success",
            "new_balance": current_user.token_balance,
            "amount_added": request.amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/users/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_user)):
    return UserResponse.model_validate(current_user)

@app.get("/users/me/invocations", response_model=List[Dict[str, Any]])
async def get_user_invocations(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all invocations for the current user"""
    invocations = db.query(AgentInvocation).filter(
        AgentInvocation.user_id == current_user.id
    ).order_by(AgentInvocation.created_at.desc()).all()
    
    return [{
        "id": inv.id,
        "agent_id": inv.agent_id,
        "agent_name": inv.agent.name,
        "input_data": inv.input_data,
        "output_data": inv.output_data,
        "tokens_used": inv.tokens_used,
        "created_at": inv.created_at.isoformat()
    } for inv in invocations]

# Pre-configured agents
AVAILABLE_AGENTS = {
    "resume_reviewer": ResumeReviewerAgent(),
    "code_reviewer": CodeReviewAgent(),
    "interview_prep": InterviewPrepAgent(),
    "writing_assistant": WritingAssistantAgent(),
    "technical_troubleshooter": TechnicalTroubleshooterAgent()
}

# Map agent display names to implementation keys
AGENT_NAME_TO_KEY = {
    "Interview Prep Assistant": "interview_prep",
    "Code Reviewer": "code_reviewer",
    "Resume Reviewer": "resume_reviewer",
    "Technical Troubleshooter": "technical_troubleshooter",
    "Writing Assistant": "writing_assistant"
}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
