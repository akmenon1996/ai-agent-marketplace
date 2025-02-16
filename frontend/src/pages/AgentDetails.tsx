import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  TextField,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../store/AuthContext';
import { agentService } from '../services/agent';
import type { Agent } from '../types/agent';

export const AgentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [agent, setAgent] = useState<Agent | null>(null);
  const [input, setInput] = useState('');
  const [output, setOutput] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [invoking, setInvoking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [tokenBalance, setTokenBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchAgent = async () => {
      if (!token || !id) return;

      try {
        const response = await agentService.getAgent(token, parseInt(id, 10));
        if (response.status === 'success' && response.data) {
          setAgent(response.data);
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
  }, [token, id]);

  const handlePurchase = async () => {
    if (!agent || !token) return;

    try {
      const response = await agentService.purchaseAgent(token, agent.id, agent.price);
      if (response.status === 'success') {
        // Update the agent's purchased status
        setAgent(prev => prev ? { ...prev, is_purchased: true } : null);
        setIsPurchased(true);
        // Update user's token balance
        if (response.data) {
          setTokenBalance(response.data.remaining_balance);
        }
      } else {
        setError(response.error || 'Failed to purchase agent');
      }
    } catch (err) {
      setError('Failed to purchase agent');
    }
  };

  const handleInvoke = async () => {
    if (!token || !agent) return;

    setInvoking(true);
    setError(null);
    setOutput(null);

    try {
      let request: any;
      // Map display names to implementation names
      const agentTypeMap: { [key: string]: string } = {
        'Interview Prep Assistant': 'interview_prep',
        'Code Reviewer': 'code_reviewer',
        'Resume Reviewer': 'resume_reviewer',
        'Technical Troubleshooter': 'technical_troubleshooter',
        'Writing Assistant': 'writing_assistant'
      };
      console.log('Agent name:', agent.name);
      const agentType = agentTypeMap[agent.name];
      console.log('Mapped agent type:', agentType);
      
      if (!agentType) {
        throw new Error(`Unsupported agent type: ${agent.name}`);
      }

      switch (agent.name) {
        case 'Interview Prep Assistant':
          request = {
            agent_type: agentType,
            interview_prep: {
              topic: input,
              experience_level: "senior",
              context: "Technical interview preparation"
            }
          };
          break;
        
        case 'Code Reviewer':
          request = {
            agent_type: agentType,
            code_review: {
              code: input,
              language: "python",
              context: "Code review request"
            }
          };
          break;
        
        case 'Resume Reviewer':
          request = {
            agent_type: agentType,
            resume_review: {
              resume_text: input,
              context: "Resume review request"
            }
          };
          break;
        
        default:
          throw new Error(`Unsupported agent type: ${agent.name}`);
      }

      console.log('Invoking agent with request:', request);
      const response = await agentService.invokeAgent(token, agent.id, request);
      console.log('Agent response:', response);

      if (response.status === 'success' && response.data) {
        setOutput(response.data.output_text || 'No output received');
      } else {
        const errorMessage = response.error;
        setError(typeof errorMessage === 'string' ? errorMessage : 'Failed to invoke agent');
      }
    } catch (err: any) {
      console.error('Error invoking agent:', err);
      setError(err?.message || 'Failed to invoke agent');
    } finally {
      setInvoking(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!agent) {
    return (
      <Container>
        <Alert severity="error">Agent not found</Alert>
      </Container>
    );
  }

  const isOwned = agent.is_purchased;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          {agent.name}
        </Typography>
        <Typography variant="body1" paragraph>
          {agent.description}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Price: {agent.price} tokens
        </Typography>
      </Paper>

      <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
        {!loading && agent && (
          <>
            {isOwned ? (
              <Button
                variant="contained"
                color="success"
                disabled
                sx={{ textTransform: 'none' }}
              >
                Purchased
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handlePurchase}
                disabled={loading || !user?.token_balance || user.token_balance < agent.price}
                sx={{ textTransform: 'none' }}
              >
                Purchase ({agent.price} tokens)
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleInvoke}
              disabled={loading || !isOwned || invoking}
              sx={{ textTransform: 'none' }}
            >
              {invoking ? 'Running...' : 'Run Agent'}
            </Button>
          </>
        )}
      </Box>

      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Try it out
        </Typography>
        <TextField
          fullWidth
          multiline
          rows={4}
          variant="outlined"
          placeholder="Enter your input here..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          sx={{ mb: 2 }}
        />
        <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button
            variant="contained"
            onClick={handleInvoke}
            disabled={!input || invoking}
          >
            {invoking ? <CircularProgress size={24} /> : 'Invoke Agent'}
          </Button>
        </Box>

        {output && (
          <Paper sx={{ p: 2, mt: 2, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom>
              Output
            </Typography>
            <Typography
              variant="body1"
              sx={{
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                fontFamily: 'monospace',
              }}
            >
              {output}
            </Typography>
          </Paper>
        )}
      </Paper>
    </Container>
  );
};
