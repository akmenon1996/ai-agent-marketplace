import React from 'react';
import { Outlet } from 'react-router-dom';
import { Box } from '@mui/material';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../store/AuthContext';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { token } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {token && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
      
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Navbar
          onMenuClick={toggleSidebar}
          showMenuButton={!!token}
        />
        
        <Box
          component="div"
          sx={{
            flexGrow: 1,
            p: 3,
            width: '100%',
            overflow: 'auto',
          }}
        >
          {children || <Outlet />}
        </Box>
      </Box>
    </Box>
  );
};
