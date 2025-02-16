# AI Agent Marketplace

A modern, full-stack AI agent marketplace built with FastAPI and React. The platform enables users to access various AI-powered services like code review, resume review, interview preparation, writing assistance, and technical troubleshooting.

## Features

### Backend (FastAPI)
- User authentication with JWT tokens
- Token-based payment system
- Multiple specialized AI agents:
  - Code Reviewer: Analyzes code and provides improvement suggestions
  - Resume Reviewer: Reviews resumes and provides feedback
  - Interview Prep Assistant: Helps prepare for technical interviews
  - Writing Assistant: Helps improve writing and content
  - Technical Troubleshooter: Helps solve technical problems
- Usage tracking and billing
- Developer earnings system
- OpenAI GPT-4 integration for AI capabilities

### Frontend (React + TypeScript)
- Modern, responsive UI with Material-UI
- Secure authentication flow
- Interactive agent marketplace
- Real-time token balance updates
- Developer dashboard for earnings
- Seamless agent interaction interface

## Prerequisites

- Python 3.9+
- Node.js 16+
- SQLite (or PostgreSQL for production)
- OpenAI API key

## Installation

### Backend Setup

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
SECRET_KEY=your-secret-key
OPENAI_API_KEY=your-openai-api-key
```

5. Initialize the database:
```bash
python init_db.py
```

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env.local` for environment variables:
```
REACT_APP_API_URL=http://localhost:8000
```

## Running the Application

1. Start the backend server:
```bash
cd windsurf-project
source venv/bin/activate
uvicorn src.main:app --reload
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## Using the Marketplace

1. Register a new account or log in
2. Purchase tokens to use the agents
3. Browse available agents in the marketplace
4. Select an agent to use its services
5. Input your requirements and submit
6. View the AI-generated response

## API Documentation

Full API documentation is available at `/docs` when running the server. Key endpoints include:

### Authentication
- POST `/token`: Get authentication token
- POST `/users/register`: Register new user

### Marketplace
- GET `/agents`: List available agents
- GET `/agents/{id}`: Get agent details
- POST `/agents/purchase`: Purchase an agent
- POST `/agents/invoke/{id}`: Use an agent's services

### Tokens
- POST `/tokens/purchase`: Purchase tokens
- GET `/users/me`: Get user info including token balance

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
