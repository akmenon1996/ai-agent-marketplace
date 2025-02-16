import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '../components/layout/Layout';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';

// Public Pages
import { Home } from '../pages/Home';
import { Marketplace } from '../pages/Marketplace';
import { AgentDetails } from '../pages/AgentDetails';

// Protected Pages
import { Dashboard } from '../pages/Dashboard';
import { Profile } from '../pages/Profile';
import { History } from '../pages/History';

// Agent Pages
import { CodeReviewPage } from '../pages/agents/CodeReviewPage';
import { ResumeReviewPage } from '../pages/agents/ResumeReviewPage';
import { InterviewPrepPage } from '../pages/agents/InterviewPrepPage';
import { WritingAssistantPage } from '../pages/agents/WritingAssistantPage';
import { TechnicalTroubleshootingPage } from '../pages/agents/TechnicalTroubleshootingPage';

// Developer Pages
import { DeveloperDashboard } from '../pages/developer/DeveloperDashboard';
import { AgentManagement } from '../pages/developer/AgentManagement';
import { Analytics } from '../pages/developer/Analytics';

export const Router: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route
        path="/"
        element={
          <Layout>
            <Home />
          </Layout>
        }
      />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/marketplace"
        element={
          <Layout>
            <Marketplace />
          </Layout>
        }
      />
      <Route
        path="/agents/:id"
        element={
          <Layout>
            <AgentDetails />
          </Layout>
        }
      />

      {/* Protected Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/history"
        element={
          <ProtectedRoute>
            <Layout>
              <History />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Agent Routes */}
      <Route
        path="/agents/code-review"
        element={
          <ProtectedRoute>
            <Layout>
              <CodeReviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents/resume-review"
        element={
          <ProtectedRoute>
            <Layout>
              <ResumeReviewPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents/interview-prep"
        element={
          <ProtectedRoute>
            <Layout>
              <InterviewPrepPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents/writing-assistant"
        element={
          <ProtectedRoute>
            <Layout>
              <WritingAssistantPage />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/agents/tech-support"
        element={
          <ProtectedRoute>
            <Layout>
              <TechnicalTroubleshootingPage />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Developer Routes */}
      <Route
        path="/developer"
        element={
          <ProtectedRoute>
            <Layout>
              <DeveloperDashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/agents"
        element={
          <ProtectedRoute>
            <Layout>
              <AgentManagement />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/developer/analytics"
        element={
          <ProtectedRoute>
            <Layout>
              <Analytics />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
