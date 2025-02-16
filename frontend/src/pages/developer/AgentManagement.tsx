import React, { useEffect, useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useAuth } from '../../store/AuthContext';
import { agentService } from '../../services/agent';
import { Agent } from '../../types/agent';

interface AgentFormData {
  name: string;
  description: string;
  type: string;
  price: number;
}

export const AgentManagement: React.FC = () => {
  const { token } = useAuth();
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);
  const [formData, setFormData] = useState<AgentFormData>({
    name: '',
    description: '',
    type: '',
    price: 0,
  });

  const fetchAgents = async () => {
    if (!token) return;

    try {
      const response = await agentService.listAgents(token);
      if (response.status === 'success' && response.data) {
        setAgents(response.data);
      } else {
        setError(response.error || 'Failed to fetch agents');
      }
    } catch (err) {
      setError('Failed to fetch agents');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    try {
      const response = selectedAgent
        ? await agentService.updateAgent(token, selectedAgent.id, formData)
        : await agentService.createAgent(token, formData);

      if (response.status === 'success') {
        await fetchAgents();
        handleCloseDialog();
      } else {
        setError(response.error || 'Failed to save agent');
      }
    } catch (err) {
      setError('Failed to save agent');
    }
  };

  const handleEdit = (agent: Agent) => {
    setSelectedAgent(agent);
    setFormData({
      name: agent.name,
      description: agent.description,
      type: agent.type,
      price: agent.price,
    });
    setDialogOpen(true);
  };

  const handleDelete = async (agent: Agent) => {
    if (!token) return;

    try {
      const response = await agentService.deleteAgent(token, agent.id);
      if (response.status === 'success') {
        await fetchAgents();
        setDeleteDialogOpen(false);
      } else {
        setError(response.error || 'Failed to delete agent');
      }
    } catch (err) {
      setError('Failed to delete agent');
    }
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAgent(null);
    setFormData({
      name: '',
      description: '',
      type: '',
      price: 0,
    });
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h5">Agent Management</Typography>
        <Button variant="contained" color="primary" onClick={() => setDialogOpen(true)}>
          Create Agent
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Price</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {agents.map((agent) => (
              <TableRow key={agent.id}>
                <TableCell>{agent.name}</TableCell>
                <TableCell>{agent.description}</TableCell>
                <TableCell>{agent.type}</TableCell>
                <TableCell>${agent.price}</TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleEdit(agent)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton
                    color="error"
                    onClick={() => {
                      setSelectedAgent(agent);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{selectedAgent ? 'Edit Agent' : 'Create Agent'}</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                label="Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
                multiline
                rows={4}
                fullWidth
              />
              <TextField
                label="Type"
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                required
                fullWidth
              />
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                required
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {selectedAgent ? 'Save' : 'Create'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Delete Agent</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete {selectedAgent?.name}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={() => selectedAgent && handleDelete(selectedAgent)}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};
