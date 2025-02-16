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
  CircularProgress,
  Box,
  Alert,
} from '@mui/material';
import { useAuth } from '../store/AuthContext';
import { agentService } from '../services/agent';
import type { AgentInvocationResponse } from '../types/agent';

export const History: React.FC = () => {
  const { token } = useAuth();
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
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Invocation History
        </Typography>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Created At</TableCell>
                <TableCell>Purchase ID</TableCell>
                <TableCell>Input</TableCell>
                <TableCell>Output</TableCell>
                <TableCell>Tokens Used</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {invocations.map((invocation) => (
                <TableRow key={invocation.id}>
                  <TableCell>{invocation.id}</TableCell>
                  <TableCell>
                    {new Date(invocation.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>{invocation.purchase_id}</TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography noWrap>{invocation.input_text}</Typography>
                  </TableCell>
                  <TableCell sx={{ maxWidth: 200 }}>
                    <Typography noWrap>{invocation.output_text}</Typography>
                  </TableCell>
                  <TableCell align="right">{invocation.tokens_used}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};
