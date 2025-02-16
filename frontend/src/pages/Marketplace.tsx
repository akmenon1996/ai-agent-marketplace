import React, { useEffect, useState } from 'react';
import { Container, Grid, Typography, Alert } from '@mui/material';
import { AgentCard } from '../components/agents/AgentCard';
import { agentService } from '../services/agent';
import { useAuth } from '../store/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { Agent } from '../types/agent';

export const Marketplace: React.FC = () => {
  const { user, token } = useAuth();
  const navigate = useNavigate();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAgents = async () => {
      if (!token) {
        setError('Please log in to view the marketplace');
        return;
      }

      setError(null);
      try {
        const response = await agentService.listAgents(token);
        if (response.status === 'success' && response.data) {
          setAgents(response.data);
        } else {
          setError(response.error || 'Failed to fetch agents');
        }
      } catch (err) {
        setError('Failed to load agents');
      }
    };

    fetchAgents();
  }, [token]);

  const handleSelectAgent = (agent: Agent) => {
    navigate(`/agents/${agent.id}`);
  };

  if (error) {
    return (
      <Container>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Agent Marketplace
      </Typography>

      <Grid container spacing={3}>
        {agents.map((agent) => (
          <Grid item xs={12} sm={6} md={4} key={agent.id}>
            <AgentCard
              agent={agent}
              onSelect={handleSelectAgent}
            />
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
