import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import { useAuth } from '../../store/AuthContext';

export const AuthLayout: React.FC = () => {
  const { token } = useAuth();
  const location = useLocation();

  // If user is already logged in, redirect to home
  if (token) {
    return <Navigate to="/" replace />;
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
      }}
    >
      <Container
        component="main"
        maxWidth="xs"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          flex: 1,
        }}
      >
        <Outlet />
      </Container>
    </Box>
  );
};
