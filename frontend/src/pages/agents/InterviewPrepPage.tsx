import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Alert, Paper } from '@mui/material';
import { InterviewPrepForm, type InterviewPrepFormData } from '../../components/forms/InterviewPrepForm';
import { agentService } from '../../services/agent';
import type { AgentInvocationRequest, AgentInvocationResponse } from '../../types/agent';
import { useAuth } from '../../store/AuthContext';

export const InterviewPrepPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AgentInvocationResponse | null>(null);

  useEffect(() => {
    console.log('InterviewPrepPage mounted');
    return () => console.log('InterviewPrepPage unmounted');
  }, []);

  useEffect(() => {
    console.log('Token state:', token ? 'Present' : 'Missing');
  }, [token]);

  const handleSubmit = async (data: InterviewPrepFormData) => {
    console.log('Form submitted with data:', data);
    setLoading(true);
    setError(null);
    setResult(null);

    if (!token) {
      console.error('No token available');
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      console.log('Preparing request payload');
      const request: AgentInvocationRequest = {
        agent_type: 'Interview Prep Assistant',
        interview_prep: {
          topic: data.role,
          experience_level: data.experience_level,
          context: `Company: ${data.company || 'Not specified'}\nFocus Areas: ${data.focus_areas || 'General'}`
        }
      };
      console.log('Request payload:', request);

      console.log('Calling agentService.invokeAgent');
      const response = await agentService.invokeAgent(token, 1, request);
      console.log('Agent response received:', response);

      if (response.status === 'error') {
        console.error('Error status in response:', response.error);
        throw new Error(response.error || 'Failed to get interview preparation');
      }

      if (!response.data) {
        console.error('No data in response');
        throw new Error('No response data received');
      }

      console.log('Setting result:', response.data);
      setResult(response.data);
    } catch (err: any) {
      console.error('Error details:', {
        error: err,
        message: err.message,
        stack: err.stack,
        response: err.response
      });
      setError(err?.message || 'An error occurred while preparing the interview');
    } finally {
      console.log('Request completed, setting loading to false');
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Interview Preparation
        </Typography>
        
        <Typography variant="body1" paragraph>
          Get personalized interview preparation assistance. Our AI will help you
          prepare for your upcoming interview with targeted questions and guidance.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <InterviewPrepForm onSubmit={handleSubmit} loading={loading} />

        {result && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Interview Preparation
            </Typography>
            <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
              <Typography
                variant="body1"
                sx={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontFamily: 'monospace',
                }}
              >
                {result.output_data}
              </Typography>
            </Paper>
          </Paper>
        )}
      </Box>
    </Container>
  );
};
