import React, { useState } from 'react';
import { Container, Typography, Box, Alert, Paper } from '@mui/material';
import { CodeReviewForm } from '../../components/forms/CodeReviewForm';
import { agentService } from '../../services/agent';
import type { AgentInvocationRequest, AgentInvocationResponse } from '../../types/agent';
import { useAuth } from '../../store/AuthContext';

export const CodeReviewPage: React.FC = () => {
  const [result, setResult] = useState<AgentInvocationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSubmit = async (data: { code: string; language: string; context?: string }) => {
    setLoading(true);
    setError(null);
    
    if (!token) {
      setError('Authentication required');
      setLoading(false);
      return;
    }

    try {
      const request: AgentInvocationRequest = {
        agent_type: 'Code Reviewer',
        code_review: {
          code: data.code,
          language: data.language,
          context: data.context
        }
      };

      const response = await agentService.invokeAgent(token, 2, request);

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
          Code Review
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <CodeReviewForm onSubmit={handleSubmit} loading={loading} />

        {result && (
          <Paper sx={{ mt: 4, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Review Results
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
