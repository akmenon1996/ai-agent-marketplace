import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Divider,
  Grid,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Alert,
  Tooltip,
} from '@mui/material';
import {
  TokenOutlined,
  CheckCircleOutline,
  Timer,
  Security,
  Code,
  ShoppingCart,
  Login,
} from '@mui/icons-material';
import { Agent } from '../../types/agent';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../store/AuthContext';

interface AgentDetailProps {
  agent: Agent;
  onPurchase: (agent: Agent) => void;
}

export const AgentDetail: React.FC<AgentDetailProps> = ({
  agent,
  onPurchase,
}) => {
  const navigate = useNavigate();
  const { token } = useAuth();

  const features = [
    'Advanced AI-powered analysis',
    'Real-time feedback and suggestions',
    'Customizable parameters',
    'Detailed reporting',
  ];

  return (
    <Card>
      <CardContent>
        <Typography variant="h4" component="h1" gutterBottom>
          {agent.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" paragraph>
          {agent.description}
        </Typography>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Key Features
          </Typography>
          <List>
            {features.map((feature) => (
              <ListItem key={feature}>
                <ListItemIcon>
                  <CheckCircleOutline color="primary" />
                </ListItemIcon>
                <ListItemText primary={feature} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Box sx={{ mt: 4 }}>
          <Typography variant="h6" gutterBottom>
            Pricing
          </Typography>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              mt: 2,
            }}
          >
            <TokenOutlined color="primary" sx={{ mr: 1 }} />
            <Typography variant="h4" component="span" color="primary">
              {agent.price}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ ml: 1 }}>
              credits
            </Typography>
          </Box>
        </Box>
      </CardContent>

      <CardActions sx={{ p: 2 }}>
        {token ? (
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={() => onPurchase(agent)}
            startIcon={<ShoppingCart />}
            fullWidth
          >
            Purchase Access
          </Button>
        ) : (
          <Tooltip title="Please log in to purchase">
            <span>
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/auth/login')}
                startIcon={<Login />}
                fullWidth
              >
                Log in to Purchase
              </Button>
            </span>
          </Tooltip>
        )}
      </CardActions>
    </Card>
  );
};
