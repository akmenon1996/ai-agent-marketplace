import React, { useState, useEffect } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Container, Typography, Box, Button, TextField, Paper, Alert, CircularProgress } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useAuth } from '../store/AuthContext';
import { agentService } from '../services/agent';
import type { Agent } from '../types/agent';
import MarkdownOutput from '../components/MarkdownOutput';
import CollapsibleText from '../components/CollapsibleText';
import { parseContent } from '../utils/parseContent';

interface LocationState {
  previousChat?: {
    query: string;
    response: string;
    showAsPreviousContext?: boolean;
  };
}

export const AgentDetails: React.FC = () => {
  const params = useParams<{ id: string }>();
  const location = useLocation();
  const { previousChat } = (location.state as LocationState) || {};
  const { token, user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [previousContext, setPreviousContext] = useState<{query: string; response: string} | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!token || !params.id) return;

      try {
        const response = await agentService.getAgent(token, parseInt(params.id, 10));
        if (response.status === 'success' && response.data) {
          setAgent(response.data);
          // If we have previous chat history, set it as context
          if (previousChat) {
            if (previousChat.showAsPreviousContext) {
              setPreviousContext({
                query: previousChat.query,
                response: previousChat.response
              });
            } else {
              setInput(previousChat.query);
              setOutput(previousChat.response);
            }
          }
        } else {
          setError(response.error || 'Failed to fetch agent details');
        }
      } catch (err) {
        setError('Failed to fetch agent details');
      } finally {
        setLoading(false);
      }
    };

    fetchAgent();
  }, [token, params.id, previousChat]);

  const handlePurchase = async () => {
    if (!agent || !token) return;

    try {
      const response = await agentService.purchaseAgent(token, agent.id, agent.price);
      if (response.status === 'success') {
        // Refresh agent data to update purchase status
        const agentResponse = await agentService.getAgent(token, agent.id);
        if (agentResponse.status === 'success' && agentResponse.data) {
          setAgent(agentResponse.data);
        }
      } else {
        setError(response.error || 'Failed to purchase agent');
      }
    } catch (err) {
      setError('Failed to purchase agent');
    }
  };

  const handleInvoke = async () => {
    if (!agent || !token || !input.trim()) return;

    try {
      const request = {
        agent_type: agent.name.toLowerCase().replace(/ /g, '_'),
        input_text: input
      };
      
      const response = await agentService.invokeAgent(token, agent.id, request);
      console.log('Agent response:', response);

      if (response.status === 'success' && response.data) {
        setOutput(parseContent(response.data.output_data || ''));
      } else {
        const errorMessage = response.error;
        setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to invoke agent');
      }
    } catch (err) {
      setError('Failed to invoke agent');
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!agent) {
    return (
      <Container>
        <Alert severity="error">Agent not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {agent && (
        <>
          <Typography variant="h4" gutterBottom>
            {agent.name}
          </Typography>
          <Typography variant="body1" paragraph>
            {agent.description}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Price: {agent.price} tokens
          </Typography>
          
          <Typography variant="h6" gutterBottom sx={{ mt: 4 }}>
            Try it out
          </Typography>

          {previousContext && (
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                Previous Context:
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Query:
                  </Typography>
                  <Typography variant="body1">{previousContext.query}</Typography>
                </Box>
                <Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Response:
                  </Typography>
                  <MarkdownOutput content={previousContext.response} />
                </Box>
              </Paper>
            </Box>
          )}

          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your query here..."
            sx={{ mb: 2 }}
          />
          
          <Button
            variant="contained"
            onClick={handleInvoke}
            disabled={!input.trim()}
            startIcon={<SendIcon />}
          >
            Invoke Agent
          </Button>

          {output && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Output
              </Typography>
              <Paper variant="outlined" sx={{ p: 2 }}>
                <MarkdownOutput content={output} />
              </Paper>
            </Box>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </>
      )}
    </Container>
  );
};
