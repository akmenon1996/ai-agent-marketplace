# AI Agent Hub - Usage Guide

## Getting Started

### Installation
1. Clone the repository:
```bash
git clone https://github.com/akmenon1996/ai-agent-marketplace.git
cd ai-agent-marketplace
```

2. Install backend dependencies:
```bash
pip install -r requirements.txt
```

3. Install frontend dependencies:
```bash
cd frontend
npm install
```

### Configuration
1. Create a `.env` file in the root directory:
```env
OPENAI_API_KEY=your_openai_api_key
JWT_SECRET=your_jwt_secret
DATABASE_URL=your_database_url
```

2. Set up the database:
```bash
python src/database/init_db.py
```

## Using the Platform

### 1. Authentication
1. Register a new account at `/auth/register`
2. Login with your credentials at `/auth/login`
3. You'll receive a JWT token for API authentication

### 2. Managing Tokens
1. View your token balance in the user profile
2. Purchase additional tokens through the token management interface
3. Monitor token usage in the history page

### 3. Using AI Agents

#### Code Review Agent
1. Navigate to the Code Review Agent in the marketplace
2. Paste your code in the input field
3. Select the programming language
4. Add any specific review context
5. Submit for review

#### Resume Reviewer Agent
1. Access the Resume Reviewer from the marketplace
2. Upload or paste your resume text
3. Specify industry context if needed
4. Submit for analysis

#### Interview Prep Agent
1. Select the Interview Prep Agent
2. Enter your interview question or topic
3. Provide any additional context
4. Get AI-powered interview preparation help

#### Writing Assistant Agent
1. Choose the Writing Assistant from available agents
2. Input your text content
3. Specify the type of assistance needed
4. Receive writing improvements and suggestions

### 4. Viewing History
- Access your usage history from the profile page
- View detailed logs of agent interactions
- Track token consumption per request

## Testing

### Running the Screenshot Bot
The screenshot bot helps test the platform's functionality:

1. Install test dependencies:
```bash
cd screenshots_bot
pip install -r requirements.txt
```

2. Run the bot:
```bash
python agent_test_bot.py
```

This will:
- Test login functionality
- Navigate through all agents
- Capture screenshots of each step
- Generate test results

## Support
For technical support or questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the technical documentation for detailed system information
