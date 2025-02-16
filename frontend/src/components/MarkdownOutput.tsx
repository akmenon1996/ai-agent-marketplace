import React from 'react';
import { Box } from '@mui/material';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownOutputProps {
  content: string;
}

const MarkdownOutput: React.FC<MarkdownOutputProps> = ({ content }) => {
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

export default MarkdownOutput;
