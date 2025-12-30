import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import AuthTokenSync from './components/AuthTokenSync';
import LandingPage from './pages/LandingPage';
import ReportingFormPage from './pages/ReportingFormPage';
import ThankYouPage from './pages/ThankYouPage';
import SecretKeyLoginPage from './pages/SecretKeyLoginPage';
import UserCasePage from './pages/UserCasePage';
import AdminLoginPage from './pages/AdminLoginPage';
import AdminInboxPage from './pages/AdminInboxPage';
import AdminCasePage from './pages/AdminCasePage';
import AdminTenantsPage from './pages/AdminTenantsPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthTokenSync>
        <BrowserRouter>
          <Layout>
            <Routes>
              {/* Public Reporter Routes */}
              <Route path="/" element={<LandingPage />} />
              <Route path="/company/:tenantId/report" element={<ReportingFormPage />} />
              <Route path="/thanks" element={<ThankYouPage />} />
              <Route path="/check" element={<SecretKeyLoginPage />} />
              <Route path="/case/:id" element={<UserCasePage />} />

              {/* Auth Routes */}
              <Route path="/login" element={<AdminLoginPage />} />

              {/* Protected Admin Routes */}
              <Route path="/admin" element={<Navigate to="/admin/inbox" replace />} />
              <Route path="/admin/inbox" element={
                <ProtectedRoute>
                  <AdminInboxPage />
                </ProtectedRoute>
              } />
              <Route path="/admin/case/:id" element={
                <ProtectedRoute>
                  <AdminCasePage />
                </ProtectedRoute>
              } />
              <Route path="/admin/tenants" element={
                <ProtectedRoute>
                  <AdminTenantsPage />
                </ProtectedRoute>
              } />
            </Routes>
          </Layout>
        </BrowserRouter>
        <Toaster position="top-right" />
      </AuthTokenSync>
    </QueryClientProvider>
  );
};

export default App;


