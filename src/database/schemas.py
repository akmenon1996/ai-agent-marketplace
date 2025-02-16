from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict
from datetime import datetime

# Token schemas
class TokenResponse(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

# User schemas
class UserBase(BaseModel):
    username: str
    email: EmailStr
    is_developer: bool = False

class UserCreate(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    token_balance: float
    created_at: datetime
    is_active: bool

    class Config:
        from_attributes = True

# Agent schemas
class AgentBase(BaseModel):
    name: str
    description: str
    price: float

class AgentCreate(AgentBase):
    pass

class AgentResponse(AgentBase):
    id: int
    developer_id: int
    is_active: bool
    is_purchased: bool = False

    class Config:
        from_attributes = True

# Purchase schemas
class PurchaseBase(BaseModel):
    agent_id: int
    purchase_price: float

class PurchaseCreate(PurchaseBase):
    pass

class AgentPurchaseResponse(PurchaseBase):
    purchase_id: int
    remaining_balance: float

    class Config:
        from_attributes = True

# Invocation schemas
class CodeReviewInvocation(BaseModel):
    code: str
    language: str = "python"
    context: Optional[str] = None

class ResumeReviewInvocation(BaseModel):
    resume_text: str
    context: Optional[str] = None

class InterviewPrepInvocation(BaseModel):
    topic: str
    experience_level: str = "entry"
    context: Optional[str] = None

class WritingAssistantInvocation(BaseModel):
    text: str
    style: Optional[str] = None
    context: Optional[str] = None

class TechnicalTroubleshootingInvocation(BaseModel):
    problem: str
    system_info: Optional[str] = None
    context: Optional[str] = None

class InvocationBase(BaseModel):
    agent_type: str
    code_review: Optional[CodeReviewInvocation] = None
    resume_review: Optional[ResumeReviewInvocation] = None
    interview_prep: Optional[InterviewPrepInvocation] = None
    writing_assistant: Optional[WritingAssistantInvocation] = None
    technical_troubleshooting: Optional[TechnicalTroubleshootingInvocation] = None

class InvocationCreate(InvocationBase):
    pass

class InvocationResponse(BaseModel):
    id: int
    purchase_id: int
    input_text: str
    output_text: Optional[str] = None
    tokens_used: int
    created_at: datetime

    class Config:
        from_attributes = True

# Marketplace schemas
class TokenPurchase(BaseModel):
    amount: int
    currency: str = "usd"

class TokenBalance(BaseModel):
    balance: float
    transaction_id: str

class DeveloperEarnings(BaseModel):
    earnings: float
