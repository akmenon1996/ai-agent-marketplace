import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Alert,
} from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { useAuth } from '../../store/AuthContext';
import { agentService } from '../../services/agent';
import type { Agent, AgentAnalytics, TimeSeriesData } from '../../types/agent';

interface AgentMetrics {
  agent_id: number;
  agent_name: string;
  timeSeries: TimeSeriesData[];
}

export const Analytics: React.FC = () => {
  const { token } = useAuth();
  const [metrics, setMetrics] = useState<AgentMetrics[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) return;

      try {
        const agentsResponse = await agentService.listAgents(token);
        if (agentsResponse.status === 'success' && agentsResponse.data) {
          const agents = agentsResponse.data;
          const analyticsPromises = agents.map((agent: Agent) =>
            agentService.getAgentAnalytics(token, agent.id)
          );

          const analyticsResponses = await Promise.all(analyticsPromises);
          const validMetrics = analyticsResponses
            .map((response, index) => {
              if (response.status === 'success' && response.data && agents[index]) {
                return {
                  agent_id: agents[index].id,
                  agent_name: agents[index].name,
                  timeSeries: response.data.time_series,
                };
              }
              return null;
            })
            .filter((metric): metric is AgentMetrics => metric !== null);

          setMetrics(validMetrics);
        }
      } catch (err) {
        setError('Failed to fetch analytics data');
      }
    };

    fetchData();
  }, [token]);

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
        Agent Analytics
      </Typography>

      <Grid container spacing={3}>
        {metrics.map((metric) => (
          <Grid item xs={12} key={metric.agent_id}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                {metric.agent_name}
              </Typography>
              <Box sx={{ height: 300 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={metric.timeSeries}
                    margin={{
                      top: 5,
                      right: 30,
                      left: 20,
                      bottom: 5,
                    }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis
                      dataKey="timestamp"
                      tickFormatter={(value) => new Date(value).toLocaleDateString()}
                    />
                    <YAxis />
                    <Tooltip
                      labelFormatter={(value) => new Date(value).toLocaleString()}
                    />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="invocations"
                      stroke="#8884d8"
                      name="Invocations"
                    />
                    <Line
                      type="monotone"
                      dataKey="success_rate"
                      stroke="#82ca9d"
                      name="Success Rate (%)"
                    />
                    <Line
                      type="monotone"
                      dataKey="average_response_time"
                      stroke="#ffc658"
                      name="Avg Response Time (s)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};
