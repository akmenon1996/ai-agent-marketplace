import React from 'react';
import {
  List,
  ListItem,
  ListItemText,
  Typography,
  Paper,
  Divider,
  Box,
} from '@mui/material';
import { AgentInvocationResponse } from '../../types/agent';

interface InvocationHistoryProps {
  invocations: AgentInvocationResponse[];
}

export const InvocationHistory: React.FC<InvocationHistoryProps> = ({ invocations }) => {
  if (invocations.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography variant="body1" color="text.secondary">
          No agent invocations yet.
        </Typography>
      </Box>
    );
  }

  return (
    <List>
      {invocations.map((invocation, index) => (
        <React.Fragment key={invocation.id}>
          <ListItem alignItems="flex-start">
            <ListItemText
              primary={
                <Typography variant="subtitle1" component="div">
                  Invocation #{invocation.id}
                </Typography>
              }
              secondary={
                <>
                  <Typography variant="body2" color="text.secondary" component="div">
                    Input: {invocation.input_text}
                  </Typography>
                  {invocation.output_text && (
                    <Typography variant="body2" color="text.secondary" component="div" sx={{ mt: 1 }}>
                      Output: {invocation.output_text}
                    </Typography>
                  )}
                  <Box sx={{ mt: 1, display: 'flex', gap: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      Tokens Used: {invocation.tokens_used}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(invocation.created_at).toLocaleString()}
                    </Typography>
                  </Box>
                </>
              }
            />
          </ListItem>
          {index < invocations.length - 1 && <Divider />}
        </React.Fragment>
      ))}
    </List>
  );
};
