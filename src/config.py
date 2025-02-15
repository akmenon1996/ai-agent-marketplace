from pydantic_settings import BaseSettings
from functools import lru_cache
import os
from dotenv import load_dotenv

# Load environment variables
if os.path.exists(".env"):
    load_dotenv(".env")

class Settings(BaseSettings):
    # API Keys and Secrets
    OPENAI_API_KEY: str
    SECRET_KEY: str
    DATABASE_URL: str
    STRIPE_SECRET_KEY: str
    STRIPE_PUBLISHABLE_KEY: str
    STRIPE_WEBHOOK_SECRET: str = "whsec_test"  # Default test webhook secret
    
    # Application Settings
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    ALGORITHM: str = "HS256"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

    def __init__(self, **kwargs):
        super().__init__(**kwargs)
        # Override OpenAI API key if not set
        if not self.OPENAI_API_KEY or self.OPENAI_API_KEY == "your-api-key-here":
            self.OPENAI_API_KEY = "sk-svcacct-Ap2he1Qw0jBY0BHLhQ7AOMTUxObgKSn5vZpM8oMUK3At02zjwpsvWm-pup6-3fMmfu9_PST3BlbkFJZFd5rNZ4NwZ9MJapHtB76oDt7DrUKVrpT071Nz8YJadRAhmMTUdfcS0MLZDWvO1hcVAu8A"

@lru_cache()
def get_settings():
    return Settings()
