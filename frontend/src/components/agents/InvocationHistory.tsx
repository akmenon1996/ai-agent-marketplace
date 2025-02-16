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
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { AgentInvocationResponse } from '../../types/agent';

interface InvocationHistoryProps {
  invocations: AgentInvocationResponse[];
}

const MarkdownOutput: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Box sx={{ 
      '& pre': { 
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        padding: 2,
        borderRadius: 1,
        overflowX: 'auto'
      },
      '& code': {
        backgroundColor: 'rgba(0, 0, 0, 0.04)',
        padding: '2px 4px',
        borderRadius: 1,
        fontSize: '0.875rem'
      },
      '& table': {
        borderCollapse: 'collapse',
        width: '100%',
        marginBottom: 2
      },
      '& th, & td': {
        border: '1px solid rgba(0, 0, 0, 0.12)',
        padding: 1
      },
      '& blockquote': {
        borderLeft: '4px solid rgba(0, 0, 0, 0.12)',
        margin: 0,
        paddingLeft: 2,
        color: 'text.secondary'
      },
      '& img': {
        maxWidth: '100%',
        height: 'auto'
      },
      '& ul, & ol': {
        paddingLeft: 3
      },
      '& p': {
        marginBottom: 1,
        marginTop: 1
      }
    }}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </Box>
  );
};

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
          <ListItem alignItems="flex-start" sx={{ flexDirection: 'column' }}>
            <Box sx={{ width: '100%', mb: 2 }}>
              <Typography variant="subtitle1" gutterBottom>
                Invocation #{invocation.id}
              </Typography>
              <Paper variant="outlined" sx={{ p: 2, mb: 2, backgroundColor: 'rgba(0, 0, 0, 0.02)' }}>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Query:
                </Typography>
                <Typography variant="body2" sx={{ mb: 2 }}>
                  {invocation.input_data}
                </Typography>
              </Paper>
              {invocation.output_data && (
                <Paper variant="outlined" sx={{ p: 2, backgroundColor: '#f8f9fa' }}>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    Response:
                  </Typography>
                  <MarkdownOutput content={invocation.output_data} />
                </Paper>
              )}
            </Box>
            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              width: '100%',
              borderTop: '1px solid rgba(0, 0, 0, 0.12)',
              pt: 1
            }}>
              <Typography variant="body2" color="text.secondary">
                Tokens Used: {invocation.tokens_used}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {new Date(invocation.created_at).toLocaleString()}
              </Typography>
            </Box>
          </ListItem>
          {index < invocations.length - 1 && <Divider sx={{ my: 2 }} />}
        </React.Fragment>
      ))}
    </List>
  );
};
