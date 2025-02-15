from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class AgentSchema(BaseModel):
    id: Optional[int]
    name: str
    description: str
    developer_id: int
    price_per_token: float
    is_active: bool = True

    class Config:
        orm_mode = True

class AgentPurchaseSchema(BaseModel):
    id: Optional[int]
    user_id: int
    agent_id: int
    tokens_purchased: float
    purchase_date: datetime

    class Config:
        orm_mode = True

class AgentInvocationSchema(BaseModel):
    id: Optional[int]
    user_id: int
    agent_id: int
    tokens_consumed: float
    invocation_date: datetime

    class Config:
        orm_mode = True
