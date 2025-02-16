import React, { useState } from 'react';
import { Container, Typography, Box, Alert } from '@mui/material';
import { TechnicalTroubleshootingForm, TechnicalTroubleshootingFormData } from '../../components/forms/TechnicalTroubleshootingForm';
import { agentService } from '../../services/agent';
import type { AgentInvocationRequest } from '../../types/agent';
import { useAuth } from '../../store/AuthContext';

interface TechnicalTroubleshootingData {
  problem: string;
  context?: string;
  attempted_solutions?: string;
  error_messages?: string;
}

export const TechnicalTroubleshootingPage: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string | null>(null);

  const handleSubmit = async (data: TechnicalTroubleshootingFormData) => {
    if (!token) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const request: AgentInvocationRequest = {
        agent_type: 'technical_troubleshooting',
        technical_troubleshooting: {
          problem: data.problem,
          system_info: `Error Messages: ${data.error_messages || 'None'}\nAttempted Solutions: ${data.attempted_solutions || 'None'}`,
          context: data.context
        }
      };

      const response = await agentService.invokeAgent(token, 4, request);
      if (response.status === 'success' && response.data) {
        setResult(response.data.output_text || 'No output received');
      } else {
        setError(response.error || 'Failed to get troubleshooting help');
      }
    } catch (err) {
      setError('Failed to get troubleshooting help');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Technical Troubleshooting
      </Typography>
      <Typography variant="body1" paragraph>
        Get help solving technical problems. Our AI will analyze your issue and
        provide step-by-step solutions to resolve it.
      </Typography>

      {error && (
        <Box sx={{ mb: 2 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      )}

      <TechnicalTroubleshootingForm onSubmit={handleSubmit} loading={loading} />

      {result && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Troubleshooting Results
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
