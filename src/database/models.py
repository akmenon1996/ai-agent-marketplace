from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_developer = Column(Boolean, default=False)
    token_balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_active = Column(Boolean, default=True)

    # Relationships
    agents = relationship("Agent", back_populates="developer")
    purchases = relationship("AgentPurchase", back_populates="user")
    invocations = relationship("AgentInvocation", back_populates="user")

class Agent(Base):
    __tablename__ = "agents"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    developer_id = Column(Integer, ForeignKey("users.id"))
    price_per_token = Column(Float)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    developer = relationship("User", back_populates="agents")
    purchases = relationship("AgentPurchase", back_populates="agent")
    invocations = relationship("AgentInvocation", back_populates="agent")

class AgentPurchase(Base):
    __tablename__ = "agent_purchases"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    tokens_purchased = Column(Float)
    tokens_remaining = Column(Float)  # Track remaining tokens
    purchase_date = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="purchases")
    agent = relationship("Agent", back_populates="purchases")

class AgentInvocation(Base):
    __tablename__ = "agent_invocations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    agent_id = Column(Integer, ForeignKey("agents.id"))
    tokens_used = Column(Float, default=0)
    input_data = Column(String)  # JSON string
    output = Column(String)  # Output text
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String)  # processing, completed, failed, etc.

    # Relationships
    user = relationship("User", back_populates="invocations")
    agent = relationship("Agent", back_populates="invocations")
