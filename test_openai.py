import os
from dotenv import load_dotenv
from openai import OpenAI
from src.config import get_settings

# Load environment variables first
load_dotenv()

# Print all environment variables
print("Environment variables:")
for key, value in os.environ.items():
    if "KEY" in key:
        print(f"{key}: {'*' * 10}")
    else:
        print(f"{key}: {value}")

settings = get_settings()
print(f"API Key from settings: {settings.OPENAI_API_KEY[:10]}...")

client = OpenAI(api_key=settings.OPENAI_API_KEY)

try:
    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[
            {"role": "system", "content": "You are a code review assistant."},
            {"role": "user", "content": "Review this code: def add(a,b): return a+b"}
        ]
    )
    print("Success! Response:", response.choices[0].message.content)
except Exception as e:
    print("Error:", str(e))
