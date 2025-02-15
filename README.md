# AI Agent Marketplace

A FastAPI-based marketplace for AI agents that provide various services like code review, resume review, interview preparation, writing assistance, and technical troubleshooting.

## Features

- User authentication and authorization
- Token-based payment system
- Multiple specialized AI agents
- Usage tracking and billing
- Developer earnings system
- Stripe integration for payments

## Prerequisites

- Python 3.9+
- PostgreSQL
- Docker (optional)
- Stripe account for payments
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd windsurf-project
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Set up environment variables in `.env`:
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
STRIPE_SECRET_KEY=your-stripe-secret-key
```

5. Initialize the database:
```bash
alembic upgrade head
```

## Running the Application

Start the FastAPI server:
```bash
uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`.

## Testing Components

### 1. User Management

#### Register a new user:
```bash
curl -X POST "http://localhost:8000/users/register" \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "password": "testpass",
    "email": "test@example.com"
  }'
```

#### Get authentication token:
```bash
curl -X POST "http://localhost:8000/token" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=testuser&password=testpass"
```

### 2. Token Management

#### Purchase tokens:
```bash
curl -X POST "http://localhost:8000/marketplace/purchase-tokens" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "amount": 1000,
    "currency": "usd"
  }'
```

#### Check token balance:
```bash
curl -X GET "http://localhost:8000/marketplace/token-balance" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Agent Management

#### Purchase an agent:
```bash
curl -X POST "http://localhost:8000/agents/purchase" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_id": 1,
    "tokens_purchased": 100
  }'
```

### 4. Testing Agents

#### Code Review Agent (ID: 1)
```bash
curl -X POST "http://localhost:8000/agents/invoke/1" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "code_review",
    "code_review": {
      "code": "def hello():\\n    print(\\"Hello, World!\\")",
      "language": "python",
      "context": "Basic function implementation"
    }
  }'
```

#### Resume Review Agent (ID: 2)
```bash
curl -X POST "http://localhost:8000/agents/invoke/2" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "resume_review",
    "resume_review": {
      "resume_text": "Your resume text here",
      "context": "Entry level software engineering position"
    }
  }'
```

#### Interview Prep Agent (ID: 3)
```bash
curl -X POST "http://localhost:8000/agents/invoke/3" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "interview_prep",
    "interview_prep": {
      "topic": "Software Engineering",
      "experience_level": "entry",
      "context": "Full-stack web development role"
    }
  }'
```

#### Writing Assistant Agent (ID: 4)
```bash
curl -X POST "http://localhost:8000/agents/invoke/4" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "writing_assistant",
    "writing_assistant": {
      "text": "Your text here",
      "style": "formal",
      "context": "Job application cover letter"
    }
  }'
```

#### Technical Troubleshooter Agent (ID: 5)
```bash
curl -X POST "http://localhost:8000/agents/invoke/5" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "agent_type": "technical_troubleshooting",
    "technical_troubleshooting": {
      "problem": "Description of the technical issue",
      "system_info": "Relevant system information",
      "context": "Additional context about the issue"
    }
  }'
```

### 5. Payment Processing

#### Simulate a successful payment:
```bash
curl -X POST "http://localhost:8000/webhook/stripe" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "payment_intent.succeeded",
    "data": {
      "object": {
        "id": "pi_xxxx",
        "metadata": {
          "user_id": "1"
        },
        "amount": 100000
      }
    }
  }'
```

### 6. Developer Features

#### Check developer earnings:
```bash
curl -X GET "http://localhost:8000/marketplace/developer-earnings" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### View agent usage history:
```bash
curl -X GET "http://localhost:8000/marketplace/agent-usage" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Project Structure

```
windsurf-project/
├── alembic/              # Database migrations
├── src/
│   ├── agents/          # AI agent implementations
│   ├── auth/            # Authentication logic
│   ├── database/        # Database models and schemas
│   ├── middleware/      # Custom middleware
│   └── main.py          # FastAPI application
├── tests/               # Test files
├── .env                 # Environment variables
├── requirements.txt     # Python dependencies
└── README.md           # This file
```

## Development

### Adding a New Agent

1. Create a new agent file in `src/agents/`
2. Inherit from `BaseAgent` class
3. Implement the `process_request` method
4. Update the schema in `src/database/schemas.py`
5. Add the agent handling in `src/main.py`

### Running Tests

```bash
pytest
```

### Database Migrations

Create a new migration:
```bash
alembic revision --autogenerate -m "description"
```

Apply migrations:
```bash
alembic upgrade head
```

## Security Considerations

- All endpoints except registration and login require authentication
- Passwords are hashed using bcrypt
- Token-based authentication using JWT
- Rate limiting on sensitive endpoints
- Input validation using Pydantic models
- Secure handling of API keys and sensitive data

## Monitoring and Maintenance

- Check application logs for errors and usage patterns
- Monitor token balances and usage
- Keep dependencies updated
- Regularly backup the database
- Monitor Stripe webhook events
- Check OpenAI API usage and costs

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Verify PostgreSQL is running
   - Check database credentials in `.env`
   - Ensure all migrations are applied

2. **Authentication Issues**
   - Check token expiration
   - Verify correct token format in requests
   - Ensure user is active

3. **Agent Invocation Issues**
   - Verify sufficient token balance
   - Check OpenAI API key validity
   - Ensure correct request format

4. **Payment Issues**
   - Verify Stripe webhook configuration
   - Check Stripe API key validity
   - Monitor webhook event logs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

[Your License Here]
