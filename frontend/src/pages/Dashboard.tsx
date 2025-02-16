import React, { useEffect, useState } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useAuth } from '../store/AuthContext';
import { agentService } from '../services/agent';
import { Agent, AgentInvocationResponse } from '../types/agent';

export const Dashboard: React.FC = () => {
  const { user, token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [invocations, setInvocations] = useState<AgentInvocationResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const [agentsResponse, historyResponse] = await Promise.all([
          agentService.listAgents(token),
          agentService.listInvocations(token),
        ]);

        if (agentsResponse.status === 'success' && agentsResponse.data) {
          setAgents(agentsResponse.data);
        } else {
          setError(agentsResponse.error || 'Failed to fetch agents');
        }

        if (historyResponse.status === 'success' && historyResponse.data) {
          setInvocations(historyResponse.data || []);
        } else {
          setError(historyResponse.error || 'Failed to fetch invocations');
        }
      } catch (err) {
        setError('Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token]);

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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1">
              Token Balance: {user?.token_balance || 0} tokens
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Your Agents ({agents.length})
            </Typography>
            <Grid container spacing={2}>
              {agents.map((agent) => (
                <Grid item xs={12} sm={6} md={4} key={agent.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">{agent.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {agent.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Recent Invocations ({invocations.length})
            </Typography>
            <Grid container spacing={2}>
              {invocations.map((invocation) => (
                <Grid item xs={12} key={invocation.id}>
                  <Paper sx={{ p: 2 }}>
                    <Typography variant="subtitle1">
                      Invocation #{invocation.id}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Input: {invocation.input_text}
                    </Typography>
                    {invocation.output_text && (
                      <Typography variant="body2" color="text.secondary">
                        Output: {invocation.output_text}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      Tokens Used: {invocation.tokens_used}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Created: {new Date(invocation.created_at).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
