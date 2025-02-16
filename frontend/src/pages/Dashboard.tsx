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
import { AgentList } from '../components/agents/AgentList';
import { InvocationHistory } from '../components/agents/InvocationHistory';

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

  // Filter for purchased agents
  const purchasedAgents = agents.filter(agent => agent.is_purchased);

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* User Info Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome back, {user?.username}!
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Token Balance: {user?.token_balance || 0} tokens
            </Typography>
          </Paper>
        </Grid>

        {/* My Agents Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <AgentList
              agents={purchasedAgents}
              loading={loading}
              title="My Agents"
            />
          </Paper>
        </Grid>

        {/* Invocation History Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              Recent Activity
            </Typography>
            {loading ? (
              <CircularProgress />
            ) : (
              <InvocationHistory invocations={invocations} />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};
