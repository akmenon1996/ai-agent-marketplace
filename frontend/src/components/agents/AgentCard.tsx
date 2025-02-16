import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import { Token as TokenIcon } from '@mui/icons-material';
import type { Agent } from '../../types/agent';

interface AgentCardProps {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onSelect,
}) => {
  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: onSelect ? 'pointer' : 'default',
      }}
      onClick={() => onSelect?.(agent)}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h5" component="div">
          {agent.name}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {agent.description}
        </Typography>
      </CardContent>
      <CardActions sx={{ justifyContent: 'space-between', p: 2 }}>
        <Chip
          icon={<TokenIcon />}
          label={`${agent.price} tokens`}
          color="primary"
          variant="outlined"
        />
        {agent.is_purchased ? (
          <Chip 
            label="Purchased" 
            color="success"
            sx={{ minWidth: 85 }}
          />
        ) : (
          <Button 
            size="small" 
            color="primary" 
            variant="contained"
            sx={{ minWidth: 85 }}
          >
            Purchase
          </Button>
        )}
      </CardActions>
    </Card>
  );
};
