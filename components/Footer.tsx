import React from 'react';
import { Box, Typography, Link } from '@mui/material';

const Footer: React.FC = () => {
  return (
    <Box 
      component="footer"
      sx={{
        py: 2, // padding top and bottom
        px: 2, // padding left and right
        mt: 'auto', // push footer to bottom if content is short (requires parent to be flex column and child flex-grow:1)
        backgroundColor: (theme) => 
          theme.palette.mode === 'dark' ? theme.palette.grey[900] : theme.palette.grey[200],
        borderTop: (theme) => `1px solid ${theme.palette.divider}`,
        textAlign: 'center',
      }}
    >
      <Typography variant="body2" color="text.secondary">
        @keepdying hayratıdır. - <Link href="https://github.com/keepdying/itu-web-archive" target="_blank" rel="noopener noreferrer" color="inherit">
          GitHub Repository
        </Link>
      </Typography>
    </Box>
  );
};

export default Footer; 