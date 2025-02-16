import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Alert,
  CircularProgress,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  BarChart,
  AttachMoney,
  People,
  TrendingUp,
} from '@mui/icons-material';
import { useAuth } from '../../store/AuthContext';
import { agentService } from '../../services/agent';
import { useNavigate } from 'react-router-dom';
import { Agent, AgentAnalytics } from '../../types/agent';
import { ApiResponse } from '../../types/api';

interface DashboardStats {
  totalInvocations: number;
  activeAgents: number;
  totalRevenue: number;
}

interface AgentStats {
  id: number;
  name: string;
  invocations: number;
  revenue: number;
  successRate: number;
}

export const DeveloperDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalInvocations: 0,
    activeAgents: 0,
    totalRevenue: 0,
  });
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const response = await agentService.listAgents(token);
        if (response.status === 'success' && response.data) {
          setAgents(response.data);
          // For now, we'll use mock analytics data
          const mockStats: AgentStats[] = response.data.map(agent => ({
            id: agent.id,
            name: agent.name,
            invocations: Math.floor(Math.random() * 1000),
            revenue: Math.floor(Math.random() * 10000),
            successRate: Math.random() * 100,
          }));
          setAgentStats(mockStats);

          setStats({
            totalInvocations: mockStats.reduce((sum, stat) => sum + stat.invocations, 0),
            activeAgents: response.data.length,
            totalRevenue: mockStats.reduce((sum, stat) => sum + stat.revenue, 0),
          });
        } else {
          setError(response.error || 'Failed to fetch agents');
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
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '400px',
        }}
      >
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
    <Container maxWidth="lg">
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 3,
          }}
        >
          <Typography variant="h4" component="h1">
            Developer Dashboard
          </Typography>
          <Button
            variant="contained"
            onClick={() => navigate('/developer/agents/create')}
          >
            Create New Agent
          </Button>
        </Box>

        <Grid container spacing={3}>
          {/* Summary Cards */}
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <AttachMoney color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Revenue</Typography>
                </Box>
                <Typography variant="h4">${stats.totalRevenue.toFixed(2)}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <People color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Users</Typography>
                </Box>
                <Typography variant="h4">{stats.activeAgents}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <BarChart color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Invocations</Typography>
                </Box>
                <Typography variant="h4">{stats.totalInvocations}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUp color="primary" sx={{ mr: 1 }} />
                  <Typography variant="h6">Agents</Typography>
                </Box>
                <Typography variant="h4">{agents.length}</Typography>
              </CardContent>
            </Card>
          </Grid>

          {/* Agent Performance List */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Agent Performance
              </Typography>
              <List>
                {agents.map((agent) => (
                  <React.Fragment key={agent.id}>
                    <ListItem
                      sx={{ py: 2 }}
                      secondaryAction={
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() =>
                            navigate(`/developer/agents/${agent.id}`)
                          }
                        >
                          View Details
                        </Button>
                      }
                    >
                      <ListItemText
                        primary={agent.name}
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Grid container spacing={2}>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Revenue: ${agentStats.find(stat => stat.id === agent.id)?.revenue.toFixed(2) || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Users: {agentStats.find(stat => stat.id === agent.id)?.invocations || 0}
                                </Typography>
                              </Grid>
                              <Grid item xs={12} sm={4}>
                                <Typography variant="body2" color="text.secondary">
                                  Invocations: {agentStats.find(stat => stat.id === agent.id)?.invocations || 0}
                                </Typography>
                              </Grid>
                            </Grid>
                          </Box>
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
      </Box>
    </Container>
  );
};
