import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import { MainLayout } from './layouts/MainLayout';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { Dashboard } from './pages/Dashboard';
import { Enquiries } from './pages/Enquiries';
import { Clients } from './pages/Clients';
import { Weddings } from './pages/Weddings';
import { WeddingWorkspace } from './pages/WeddingWorkspace';
import { Agreements } from './pages/Agreements';
import { PublicSignAgreement } from './pages/PublicSignAgreement';
import { Vendors } from './pages/Vendors';
import { Quotations } from './pages/Quotations';
import { Tasks } from './pages/Tasks';
import { Guests } from './pages/Guests';
import { Operations } from './pages/Operations';
import { Payments } from './pages/Payments';
import { Expenses } from './pages/Expenses';
import { VendorSettlements } from './pages/VendorSettlements';
import { FinancialReports } from './pages/FinancialReports';
import { Team } from './pages/Team';
import { Notifications } from './pages/Notifications';
import { Settings } from './pages/Settings';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-gold-400 border-t-navy-900 rounded-full animate-spin mx-auto" />
          <p className="font-serif text-xs font-semibold tracking-wider text-navy-900 uppercase">
            Loading The Royal Knot...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/sign/:id" element={<PublicSignAgreement />} />

              {/* Protected Workspace Routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Dashboard />} />
                <Route path="enquiries" element={<Enquiries />} />
                <Route path="clients" element={<Clients />} />
                <Route path="weddings" element={<Weddings />} />
                <Route path="weddings/:id" element={<WeddingWorkspace />} />
                <Route path="agreements" element={<Agreements />} />
                <Route path="vendors" element={<Vendors />} />
                <Route path="quotations" element={<Quotations />} />
                <Route path="tasks" element={<Tasks />} />
                <Route path="guests" element={<Guests />} />
                <Route path="operations" element={<Operations />} />
                <Route path="payments" element={<Payments />} />
                <Route path="expenses" element={<Expenses />} />
                <Route path="vendor-settlements" element={<VendorSettlements />} />
                <Route path="finance" element={<FinancialReports />} />
                <Route path="team" element={<Team />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="settings" element={<Settings />} />
              </Route>

              {/* Catch-all Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
