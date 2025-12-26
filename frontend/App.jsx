import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import ReportingFormPage from './pages/ReportingFormPage';
import ThankYouPage from './pages/ThankYouPage';
import SecretKeyLoginPage from './pages/SecretKeyLoginPage';
import UserCasePage from './pages/UserCasePage';
import AdminInboxPage from './pages/AdminInboxPage';
import AdminCasePage from './pages/AdminCasePage';
import AdminTenantsPage from './pages/AdminTenantsPage';

const queryClient = new QueryClient();

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <HashRouter>
        <Layout>
          <Routes>
            {/* Public Reporter Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/company/:tenantId/report" element={<ReportingFormPage />} />
            <Route path="/thanks" element={<ThankYouPage />} />
            <Route path="/check" element={<SecretKeyLoginPage />} />
            <Route path="/case/:id" element={<UserCasePage />} />

            {/* Admin Routes (In a real app, these would be protected by a secure auth middleware) */}
            <Route path="/admin" element={<Navigate to="/admin/inbox" replace />} />
            <Route path="/admin/inbox" element={<AdminInboxPage />} />
            <Route path="/admin/case/:id" element={<AdminCasePage />} />
            <Route path="/admin/tenants" element={<AdminTenantsPage />} />
          </Routes>
        </Layout>
      </HashRouter>
      <Toaster position="top-right" />
    </QueryClientProvider>
  );
};

export default App;
