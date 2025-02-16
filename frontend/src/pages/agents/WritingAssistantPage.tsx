import React, { useState } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { WritingAssistantForm, WritingAssistantFormData } from '../../components/forms/WritingAssistantForm';
import { agentService } from '../../services/agent';
import type { AgentInvocationRequest } from '../../types/agent';
import { useAuth } from '../../store/AuthContext';

export const WritingAssistantPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (data: WritingAssistantFormData) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: AgentInvocationRequest = {
        agent_type: 'writing_assistant',
        writing_assistant: {
          text: data.content,
          style: data.type,
          context: `Tone: ${data.tone || 'Not specified'}\nTarget Audience: ${data.target_audience || 'General'}`
        }
      };

      const response = await agentService.invokeAgent(token, 5, request);
      if (response.status === 'success' && response.data) {
        setResult(response.data.output_data || 'No output received');
      } else {
        setError(response.error || 'Failed to get writing assistance');
      }
    } catch (err) {
      setError('Failed to get writing assistance');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Writing Assistant
      </Typography>
      <Typography variant="body1" paragraph>
        Get help with your writing. Our AI will help you improve your content,
        whether it's an email, blog post, or any other type of writing.
      </Typography>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <WritingAssistantForm onSubmit={handleSubmit} loading={loading} />

      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Improved Content
          </Typography>
          <Box
            sx={{
              p: 2,
              bgcolor: 'grey.50',
              borderRadius: 1,
              whiteSpace: 'pre-wrap',
            }}
          >
            {result}
          </Box>
        </Box>
      )}
    </Container>
  );
};
