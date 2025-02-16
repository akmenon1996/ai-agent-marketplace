import React from 'react';
import {
  Grid,
  Typography,
  Box,
  Skeleton,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Search } from '@mui/icons-material';
import { AgentCard } from './AgentCard';
import { Agent } from '../../types/agent';

interface AgentListProps {
  agents: Agent[];
  loading?: boolean;
  ownedAgents?: number[];
  title?: string;
}

export const AgentList: React.FC<AgentListProps> = ({
  agents,
  loading = false,
  ownedAgents = [],
  title = 'Available Agents',
}) => {
  const [searchTerm, setSearchTerm] = React.useState('');

  const filteredAgents = agents.filter((agent) =>
    agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    agent.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const LoadingSkeleton = () => (
    <>
      {[1, 2, 3].map((key) => (
        <Grid item xs={12} sm={6} md={4} key={key}>
          <Box sx={{ height: '100%' }}>
            <Skeleton variant="rectangular" height={200} />
          </Box>
        </Grid>
      ))}
    </>
  );

  return (
    <Box>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 3,
        }}
      >
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>

        <TextField
          size="small"
          placeholder="Search agents..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
      </Box>

      <Grid container spacing={3}>
        {loading ? (
          <LoadingSkeleton />
        ) : filteredAgents.length > 0 ? (
          filteredAgents.map((agent) => (
            <Grid item xs={12} sm={6} md={4} key={agent.id}>
              <AgentCard
                agent={agent}
                owned={ownedAgents.includes(agent.id)}
              />
            </Grid>
          ))
        ) : (
          <Grid item xs={12}>
            <Box
              sx={{
                textAlign: 'center',
                py: 4,
              }}
            >
              <Typography variant="h6" color="text.secondary">
                No agents found matching your search.
              </Typography>
            </Box>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};
