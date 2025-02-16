import React, { useState } from 'react';
import { Box, Button, Typography } from '@mui/material';
import MarkdownOutput from './MarkdownOutput';

interface CollapsibleTextProps {
  text: string;
  maxLength?: number;
  isMarkdown?: boolean;
}

const CollapsibleText: React.FC<CollapsibleTextProps> = ({ 
  text, 
  maxLength = 300,
  isMarkdown = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const shouldCollapse = text.length > maxLength;
  
  const displayText = isExpanded ? text : text.slice(0, maxLength) + (shouldCollapse ? '...' : '');

  return (
    <Box>
      {isMarkdown ? (
        <MarkdownOutput content={displayText} />
      ) : (
        <Typography 
          variant="body1" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
        >
          {displayText}
        </Typography>
      )}
      
      {shouldCollapse && (
        <Button 
          onClick={() => setIsExpanded(!isExpanded)}
          size="small"
          sx={{ mt: 1 }}
        >
          {isExpanded ? 'Show Less' : 'Show More'}
        </Button>
      )}
    </Box>
  );
};

export default CollapsibleText;
