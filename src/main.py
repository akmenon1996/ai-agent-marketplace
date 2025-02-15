from fastapi import FastAPI, Depends, HTTPException, status, Response
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy import create_engine, func
from typing import List, Dict, Any, Generator, Annotated
from datetime import timedelta
import jwt
from jwt.exceptions import InvalidTokenError, DecodeError

from .database.models import Base, User, Agent, AgentPurchase, AgentInvocation
from .database.schemas import (
    UserCreate, UserResponse, Token, TokenData,
    AgentCreate, AgentResponse,
    PurchaseCreate, PurchaseResponse,
    InvocationCreate, InvocationResponse,
    TokenPurchase, TokenBalance, DeveloperEarnings
)
from .auth.security import create_access_token, verify_password, get_password_hash
from .config import get_settings
from .middleware.error_handler import error_handler_middleware

from .agents.resume_reviewer import ResumeReviewerAgent
from .agents.code_reviewer import CodeReviewAgent
from .agents.interview_prep import InterviewPrepAgent
from .agents.writing_assistant import WritingAssistantAgent
from .agents.technical_troubleshooter import TechnicalTroubleshooterAgent

import stripe
import json
from fastapi import Request

app = FastAPI(title="AI Agent Marketplace")
app.middleware("http")(error_handler_middleware)

# Database setup
settings = get_settings()
engine = create_engine(settings.DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables
Base.metadata.create_all(bind=engine)

# Configure Stripe
stripe.api_key = settings.STRIPE_SECRET_KEY

def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

async def get_current_user(
    token: Annotated[str, Depends(oauth2_scheme)],
    db: Annotated[Session, Depends(get_db)]
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        username: str = payload.get("sub")
        if username is None:
            raise credentials_exception
    except (jwt.exceptions.InvalidTokenError, jwt.exceptions.DecodeError):
        raise credentials_exception
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise credentials_exception
    return user

async def get_current_active_user(
    current_user: Annotated[User, Depends(get_current_user)]
) -> User:
    if not current_user.is_active:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

@app.post("/users/register", response_model=UserResponse)
async def register_user(
    user: UserCreate,
    db: Annotated[Session, Depends(get_db)]
):
    # Check if username exists
    if db.query(User).filter(User.username == user.username).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    # Check if email exists
    if db.query(User).filter(User.email == user.email).first():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    db_user = User(
        username=user.username,
        email=user.email,
        hashed_password=get_password_hash(user.password),
        is_developer=user.is_developer,
        is_active=True,
        token_balance=0.0
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@app.post("/token", response_model=Token)
async def login_for_access_token(
    db: Annotated[Session, Depends(get_db)],
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()]
):
    user = db.query(User).filter(User.username == form_data.username).first()
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    access_token = create_access_token(
        data={"sub": user.username},
        expires_delta=timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/agents/create", response_model=AgentResponse)
async def create_agent(
    agent: AgentCreate,
    db: Annotated[Session, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_active_user)]
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
        price_per_token=agent.price_per_token,
        is_active=True
    )
    db.add(db_agent)
    db.commit()
    db.refresh(db_agent)
    return db_agent

@app.get("/agents", response_model=List[AgentResponse])
async def list_agents(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return db.query(Agent).filter(Agent.is_active == True).all()

@app.post("/agents/purchase", response_model=PurchaseResponse)
async def purchase_agent(
    purchase: PurchaseCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    # Check if agent exists
    agent = db.query(Agent).filter(Agent.id == purchase.agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if user has enough tokens
    if current_user.token_balance < purchase.tokens_purchased:
        raise HTTPException(
            status_code=status.HTTP_402_PAYMENT_REQUIRED,
            detail="Insufficient tokens"
        )
    
    # Create purchase record
    db_purchase = AgentPurchase(
        user_id=current_user.id,
        agent_id=purchase.agent_id,
        tokens_purchased=purchase.tokens_purchased,
        tokens_remaining=purchase.tokens_purchased  # Set initial remaining tokens
    )
    
    # Deduct tokens from user's balance
    current_user.token_balance -= purchase.tokens_purchased
    
    db.add(db_purchase)
    db.commit()
    db.refresh(db_purchase)
    
    return db_purchase

@app.post("/agents/invoke/{agent_id}", response_model=Dict[str, Any])
async def invoke_agent(
    agent_id: int,
    invocation: InvocationCreate,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    try:
        # Get the agent
        agent = db.query(Agent).filter(Agent.id == agent_id).first()
        if not agent:
            raise HTTPException(status_code=404, detail="Agent not found")
        
        # Check if user has purchased the agent
        purchase = db.query(AgentPurchase).filter(
            AgentPurchase.user_id == current_user.id,
            AgentPurchase.agent_id == agent_id
        ).first()
        
        if not purchase:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="You need to purchase this agent first"
            )
        
        # Check if user has enough tokens
        if purchase.tokens_remaining < agent.price_per_token:
            raise HTTPException(
                status_code=status.HTTP_402_PAYMENT_REQUIRED,
                detail="Insufficient tokens"
            )
        
        # Create invocation record
        invocation_record = AgentInvocation(
            user_id=current_user.id,
            agent_id=agent_id,
            input_data=json.dumps(invocation.dict()),
            tokens_used=0,
            status="processing"
        )
        db.add(invocation_record)
        db.commit()
        
        try:
            # Process the request based on agent type
            if agent.name == "Code Reviewer":
                if not invocation.code_review:
                    raise HTTPException(status_code=400, detail="Missing code review data")
                agent_instance = CodeReviewAgent()
                result = await agent_instance.process_request(
                    code=invocation.code_review.code,
                    language=invocation.code_review.language,
                    context=invocation.code_review.context
                )
            elif agent.name == "Resume Reviewer":
                if not invocation.resume_review:
                    raise HTTPException(status_code=400, detail="Missing resume review data")
                agent_instance = ResumeReviewerAgent()
                result = await agent_instance.process_request(
                    resume_text=invocation.resume_review.resume_text,
                    context=invocation.resume_review.context
                )
            elif agent.name == "Interview Prep":
                if not invocation.interview_prep:
                    raise HTTPException(status_code=400, detail="Missing interview prep data")
                agent_instance = InterviewPrepAgent()
                result = await agent_instance.process_request(
                    topic=invocation.interview_prep.topic,
                    experience_level=invocation.interview_prep.experience_level,
                    context=invocation.interview_prep.context
                )
            elif agent.name == "Writing Assistant":
                if not invocation.writing_assistant:
                    raise HTTPException(status_code=400, detail="Missing writing assistant data")
                agent_instance = WritingAssistantAgent()
                result = await agent_instance.process_request(
                    text=invocation.writing_assistant.text,
                    style=invocation.writing_assistant.style,
                    context=invocation.writing_assistant.context
                )
            elif agent.name == "Technical Troubleshooter":
                if not invocation.technical_troubleshooting:
                    raise HTTPException(status_code=400, detail="Missing technical troubleshooting data")
                agent_instance = TechnicalTroubleshooterAgent()
                result = await agent_instance.process_request(
                    issue=invocation.technical_troubleshooting.problem,
                    system_info=invocation.technical_troubleshooting.system_info,
                    context=invocation.technical_troubleshooting.context
                )
            else:
                raise HTTPException(status_code=404, detail="Agent implementation not found")
                
            # Update token usage and balance
            tokens_used = result["tokens_used"]
            purchase.tokens_remaining -= tokens_used
            
            # Update invocation record
            invocation_record.output = result["output"]
            invocation_record.status = "completed"
            invocation_record.tokens_used = tokens_used
            
            db.commit()
            
            return {
                "id": invocation_record.id,
                "output": result["output"],
                "tokens_used": tokens_used,
                "status": "completed"
            }
                
        except Exception as agent_error:
            # Roll back the invocation record if agent processing fails
            db.rollback()
            raise HTTPException(
                status_code=500,
                detail=f"Error processing agent request: {str(agent_error)}"
            )
                
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail=f"Internal server error: {str(e)}"
        )

@app.post("/marketplace/purchase-tokens", response_model=Dict[str, str])
async def purchase_tokens(
    purchase: TokenPurchase,
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    try:
        # Create Stripe payment intent
        payment_intent = stripe.PaymentIntent.create(
            amount=purchase.amount * 100,  # Convert to cents
            currency=purchase.currency,
            metadata={"user_id": current_user.id}
        )
        return {
            "client_secret": payment_intent.client_secret,
            "payment_intent_id": payment_intent.id
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/marketplace/token-balance", response_model=Dict[str, float])
async def get_token_balance(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    return {"token_balance": current_user.token_balance}

@app.get("/marketplace/usage-history", response_model=List[Dict[str, Any]])
async def get_agent_usage_history(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    invocations = db.query(AgentInvocation).filter(
        AgentInvocation.user_id == current_user.id
    ).all()
    
    return [
        {
            "id": inv.id,
            "agent_id": inv.agent_id,
            "tokens_used": inv.tokens_used,
            "status": inv.status,
            "created_at": inv.created_at
        }
        for inv in invocations
    ]

@app.get("/marketplace/developer-earnings", response_model=Dict[str, Any])
async def get_developer_earnings(
    current_user: Annotated[User, Depends(get_current_active_user)],
    db: Annotated[Session, Depends(get_db)]
):
    if not current_user.is_developer:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only developers can access earnings"
        )
    
    # Get all agents created by this developer
    agents = db.query(Agent).filter(Agent.developer_id == current_user.id).all()
    total_earnings = 0.0
    earnings_by_agent = {}
    
    for agent in agents:
        # Calculate earnings from invocations
        invocations = db.query(AgentInvocation).filter(
            AgentInvocation.agent_id == agent.id
        ).all()
        
        agent_earnings = sum(inv.tokens_used * agent.price_per_token for inv in invocations)
        earnings_by_agent[agent.name] = agent_earnings
        total_earnings += agent_earnings
    
    return {
        "total_earnings": total_earnings,
        "earnings_by_agent": earnings_by_agent
    }

@app.post("/webhook/stripe")
async def stripe_webhook(request: Request, db: Annotated[Session, Depends(get_db)]):
    try:
        # Get the raw request body
        payload = await request.body()
        
        # Parse the JSON payload
        event = json.loads(payload)

        # Handle the event
        if event["type"] == "payment_intent.succeeded":
            payment_intent = event["data"]["object"]
            user_id = payment_intent["metadata"]["user_id"]
            amount = payment_intent["amount"] / 100  # Convert from cents

            # Update user's token balance
            user = db.query(User).filter(User.id == user_id).first()
            if user:
                user.token_balance += amount
                db.commit()

        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
