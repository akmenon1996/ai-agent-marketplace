import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './store/AuthContext';
import { theme } from './theme';

// Auth Pages
import { Login } from './pages/auth/Login';
import { Register } from './pages/auth/Register';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';

// Main Pages
import { Dashboard } from './pages/Dashboard';
import { Profile } from './pages/Profile';
import { History } from './pages/History';
import { Marketplace } from './pages/Marketplace';
import { AgentDetails } from './pages/AgentDetails';

// Layout
import { Layout } from './components/layout/Layout';
import { AuthLayout } from './components/layout/AuthLayout';
import { ProtectedRoute } from './components/auth/ProtectedRoute';

const App: React.FC = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/auth/login" element={<Login />} />
              <Route path="/auth/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password/:token" element={<ResetPassword />} />
            </Route>

            {/* Main App Routes */}
            <Route element={<Layout />}>
              {/* Public Routes */}
              <Route path="/marketplace" element={<Marketplace />} />
              <Route path="/agents/:id" element={<AgentDetails />} />

              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/history"
                element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                }
              />

              {/* Default redirect */}
              <Route path="/" element={<Navigate to="/marketplace" replace />} />
            </Route>

            {/* Catch all route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
