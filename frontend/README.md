# AI Agent Marketplace Frontend

A modern React + TypeScript frontend for the AI Agent Marketplace platform. This application provides a user-friendly interface for accessing various AI-powered services.

## Features

- Modern, responsive UI built with Material-UI
- TypeScript for type safety and better development experience
- Secure authentication with JWT tokens
- Interactive marketplace for browsing and using AI agents
- Real-time token balance updates
- Developer dashboard for tracking earnings
- Seamless agent interaction interface

## Available Agents

1. **Code Reviewer**
   - Analyzes code and provides improvement suggestions
   - Supports multiple programming languages
   - Provides detailed feedback on style, efficiency, and best practices

2. **Resume Reviewer**
   - Reviews resumes and provides feedback
   - Analyzes content, structure, and impact
   - Offers specific improvement suggestions

3. **Interview Prep Assistant**
   - Helps prepare for technical interviews
   - Customized for different experience levels
   - Provides practice questions and guidance

4. **Writing Assistant**
   - Helps improve writing and content
   - Supports various writing styles
   - Offers grammar and style suggestions

5. **Technical Troubleshooter**
   - Helps solve technical problems
   - Provides step-by-step solutions
   - Explains technical concepts

## Prerequisites

- Node.js 16+
- npm or yarn
- Backend API server running

## Installation

1. Install dependencies:
```bash
npm install
```

2. Create `.env.local` file:
```
REACT_APP_API_URL=http://localhost:8000
```

## Development

Start the development server:
```bash
npm start
```

Build for production:
```bash
npm run build
```

Run tests:
```bash
npm test
```

## Project Structure

```
frontend/
├── public/              # Static files
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/         # Page components
│   ├── services/      # API services
│   ├── types/         # TypeScript types
│   ├── utils/         # Utility functions
│   └── App.tsx        # Main application component
├── package.json       # Dependencies and scripts
└── tsconfig.json     # TypeScript configuration
```

## Components

### Pages

- **Home**: Landing page with featured agents
- **Login/Register**: User authentication forms
- **Marketplace**: Browse and purchase agents
- **AgentDetails**: View and use specific agents
- **Dashboard**: User profile and token management
- **DeveloperDashboard**: Track agent usage and earnings

### Core Components

- **AgentCard**: Display agent information
- **TokenBalance**: Show user's token balance
- **AgentInvocation**: Interface for using agents
- **ResponseDisplay**: Display agent responses
- **LoadingSpinner**: Loading state indicator

## State Management

- JWT token stored in local storage
- User context for global user data
- Token balance updates in real-time
- Agent responses cached when appropriate

## API Integration

- Axios for HTTP requests
- Interceptors for token management
- Error handling and retry logic
- Real-time updates using polling

## Styling

- Material-UI for component library
- Custom theme configuration
- Responsive design for all screen sizes
- Dark mode support

## Error Handling

- Form validation with error messages
- API error handling and display
- Network error recovery
- Token expiration handling

## Testing

- Jest for unit tests
- React Testing Library for component tests
- Mock service worker for API mocking
- Cypress for end-to-end tests

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
