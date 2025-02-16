import React from 'react';
import {
  Paper,
  Box,
  Typography,
  LinearProgress,
  Alert,
  AlertTitle,
} from '@mui/material';
import { AgentInvocationResponse } from '../../types/agent';

interface AgentInvocationProps {
  title: string;
  loading?: boolean;
  error?: string | { msg: string; [key: string]: any } | null;
  result?: AgentInvocationResponse | null;
  children: React.ReactNode;
}

export const AgentInvocation: React.FC<AgentInvocationProps> = ({
  title,
  loading = false,
  error = null,
  result = null,
  children,
}) => {
  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        {title}
      </Typography>

      {loading && (
        <Box sx={{ width: '100%', mb: 2 }}>
          <LinearProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {typeof error === 'string' ? error : error.msg || 'An error occurred'}
        </Alert>
      )}

      <Paper sx={{ p: 3, mb: 3 }}>{children}</Paper>

      {result && (
        <Box sx={{ mt: 2 }}>
          <Paper
            elevation={2}
            sx={{
              p: 2,
              backgroundColor: 'background.paper',
            }}
          >
            <Typography
              variant="body1"
              component="div"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
            >
              {result.output_data}
            </Typography>
            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
              <Typography variant="body2" color="text.secondary">
                Tokens Used: {result.tokens_used}
              </Typography>
            </Box>
          </Paper>
        </Box>
      )}
    </Box>
  );
};
