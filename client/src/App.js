import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RoomPage from './pages/RoomPage';
import ProfilePage from './pages/ProfilePage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="app-loading"><span className="pulse">Loading Nexus…</span></div>;
  return user ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null;
  return !user ? children : <Navigate to="/dashboard" replace />;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
    <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
    <Route path="/register" element={<PublicRoute><RegisterPage /></PublicRoute>} />
    <Route path="/dashboard" element={<PrivateRoute><DashboardPage /></PrivateRoute>} />
    <Route path="/room/:roomId" element={<PrivateRoute><RoomPage /></PrivateRoute>} />
    <Route path="/profile" element={<PrivateRoute><ProfilePage /></PrivateRoute>} />
  </Routes>
);

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#141420',
              color: '#f0f0f5',
              border: '1px solid rgba(230,57,70,0.3)',
              borderRadius: '10px',
              fontSize: '0.875rem',
            },
            success: { iconTheme: { primary: '#e63946', secondary: '#fff' } },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
