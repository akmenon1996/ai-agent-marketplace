import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  CircularProgress,
  Box,
  Alert,
  Card,
  CardContent,
  Divider,
  Grid,
  IconButton,
  Stack,
  Button,
} from '@mui/material';
import {
  AccessTime as AccessTimeIcon,
  Token as TokenIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { useAuth } from '../store/AuthContext';
import { agentService } from '../services/agent';
import type { AgentInvocationResponse } from '../types/agent';
import MarkdownOutput from '../components/MarkdownOutput';
import CollapsibleText from '../components/CollapsibleText';
import { parseContent } from '../utils/parseContent';

interface InvocationCardProps {
  invocation: AgentInvocationResponse;
  onContinueChat: () => void;
}

const InvocationCard: React.FC<InvocationCardProps> = ({ invocation, onContinueChat }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const { token } = useAuth();

  useEffect(() => {
    const fetchSummary = async () => {
      if (!token) return;
      
      try {
        const response = await agentService.summarizeConversation(
          token,
          invocation.input_data,
          invocation.output_data || ''
        );
        
        if (response.status === 'success' && response.data?.summary) {
          setSummary(response.data.summary);
        }
      } catch (error) {
        console.error('Error fetching summary:', error);
      }
    };

    fetchSummary();
  }, [token, invocation]);

  return (
    <Card sx={{ mb: 2, width: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h6" gutterBottom>
              {invocation.agent_name}
            </Typography>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <AccessTimeIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {new Date(invocation.created_at).toLocaleString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <TokenIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {invocation.tokens_used} tokens
                </Typography>
              </Box>
            </Stack>
          </Box>
          <Button
            variant="outlined"
            startIcon={<ChatIcon />}
            onClick={onContinueChat}
            size="small"
          >
            Continue Chat
          </Button>
        </Box>

        {summary && (
          <>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Summary:
            </Typography>
            <Paper 
              variant="outlined" 
              sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
            >
              <MarkdownOutput content={summary} />
            </Paper>
          </>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Conversation:
        </Typography>
        
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Query:
          </Typography>
          <CollapsibleText text={parseContent(invocation.input_data)} maxLength={300} />
        </Box>

        <Box>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Response:
          </Typography>
          <CollapsibleText 
            text={parseContent(invocation.output_data || 'No response available')} 
            maxLength={300}
            isMarkdown
          />
        </Box>
      </CardContent>
    </Card>
  );
};

export const History: React.FC = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [invocations, setInvocations] = useState<AgentInvocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInvocations = async () => {
      if (!token) return;

      try {
        const response = await agentService.listInvocations(token);
        if (response.status === 'success' && response.data) {
          setInvocations(response.data);
        } else {
          setError(response.error || 'Failed to fetch invocations');
        }
      } catch (err) {
        setError('Failed to fetch invocation history');
      } finally {
        setLoading(false);
      }
    };

    fetchInvocations();
  }, [token]);

  const handleContinueChat = (invocation: AgentInvocationResponse) => {
    navigate(`/agents/${invocation.agent_id}`, {
      state: {
        previousChat: {
          query: parseContent(invocation.input_data),
          response: parseContent(invocation.output_data || ''),
          showAsPreviousContext: true
        }
      }
    });
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

  if (invocations.length === 0) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h6" color="text.secondary">
            No agent invocations yet
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Your agent usage history will appear here once you start using agents.
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          Agent History
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View your past agent interactions and their responses
        </Typography>
      </Box>

      <Grid container spacing={2}>
        {invocations.map((invocation) => (
          <Grid item xs={12} key={invocation.id}>
            <InvocationCard 
              invocation={invocation} 
              onContinueChat={() => handleContinueChat(invocation)}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
