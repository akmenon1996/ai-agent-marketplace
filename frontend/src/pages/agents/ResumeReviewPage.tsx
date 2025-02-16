import React, { useState } from 'react';
import { Container, Typography, Box, Alert, Paper } from '@mui/material';
import { ResumeReviewForm } from '../../components/forms/ResumeReviewForm';
import { agentService } from '../../services/agent';
import type { AgentInvocationRequest, AgentInvocationResponse } from '../../types/agent';
import { useAuth } from '../../store/AuthContext';

export const ResumeReviewPage: React.FC = () => {
  const [result, setResult] = useState<AgentInvocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (data: { resume_text: string; context?: string }) => {
    setLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const request: AgentInvocationRequest = {
        agent_type: 'Resume Reviewer',
        resume_review: {
          resume_text: data.resume_text,
          context: data.context
        }
      };

      const response = await agentService.invokeAgent(token, 3, request);

      if (response.data) {
        setResult(response.data);
      } else {
        setError(response.error || 'Failed to get response from agent');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg">
      <Box sx={{ my: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Resume Review
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <ResumeReviewForm onSubmit={handleSubmit} loading={loading} />

        {result && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Results
            </Typography>
            <Typography
              variant="body1"
              component="pre"
              sx={{
                whiteSpace: 'pre-wrap',
                fontFamily: 'monospace',
                backgroundColor: 'background.paper',
                p: 2,
                borderRadius: 1,
              }}
            >
              {result.output_text}
            </Typography>
          </Paper>
        )}
      </Box>
    </Container>
  );
};
