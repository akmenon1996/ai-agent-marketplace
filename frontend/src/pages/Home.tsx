import React from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Container,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../store/AuthContext';

const features = [
  {
    title: 'Code Review',
    description: 'Get expert feedback on your code from AI',
  },
  {
    title: 'Resume Review',
    description: 'Improve your resume with AI-powered suggestions',
  },
  {
    title: 'Interview Prep',
    description: 'Practice for interviews with customized questions',
  },
  {
    title: 'Writing Assistant',
    description: 'Enhance your writing with AI assistance',
  },
  {
    title: 'Technical Support',
    description: 'Get help with technical issues instantly',
  },
  {
    title: 'Developer Tools',
    description: 'Create and manage your own AI agents',
  },
];

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6,
          borderRadius: 2,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom>
                AI Agent Marketplace
              </Typography>
              <Typography variant="h5" paragraph>
                Access powerful AI agents for code review, writing assistance,
                technical support, and more.
              </Typography>
              <Box sx={{ mt: 4 }}>
                {!token ? (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/register')}
                  >
                    Get Started
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    color="secondary"
                    size="large"
                    onClick={() => navigate('/marketplace')}
                  >
                    Explore Agents
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg">
        <Typography variant="h4" component="h2" gutterBottom align="center">
          Features
        </Typography>
        <Grid container spacing={4} sx={{ mt: 2 }}>
          {features.map((feature) => (
            <Grid item xs={12} sm={6} md={4} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                  },
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>
    </Box>
  );
};
