from sqlalchemy import Column, Integer, String, Float, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    is_developer = Column(Boolean, default=False)
    token_balance = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    agents = relationship('Agent', back_populates='developer')
    purchases = relationship('AgentPurchase', back_populates='user')

class Agent(Base):
    __tablename__ = 'agents'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(String)
    developer_id = Column(Integer, ForeignKey('users.id'))
    price_per_token = Column(Float)
    is_active = Column(Boolean, default=True)
    
    developer = relationship('User', back_populates='agents')
    purchases = relationship('AgentPurchase', back_populates='agent')

class AgentPurchase(Base):
    __tablename__ = 'agent_purchases'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    tokens_purchased = Column(Float)
    purchase_date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship('User', back_populates='purchases')
    agent = relationship('Agent', back_populates='purchases')

class AgentInvocation(Base):
    __tablename__ = 'agent_invocations'
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey('users.id'))
    agent_id = Column(Integer, ForeignKey('agents.id'))
    tokens_consumed = Column(Float)
    invocation_date = Column(DateTime, default=datetime.utcnow)
    
    user = relationship('User')
    agent = relationship('Agent')
