import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import RoleBasedDashboard from './pages/RoleBasedDashboard';
import OrderPage from './pages/OrderPage';

const Dashboard = () => {
  const { user } = useAuth();
  
  if (user?.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard />;
  } else if (['RESTAURANT_ADMIN', 'MANAGER', 'CHEF', 'WAITER', 'CASHIER'].includes(user?.role)) {
    return <RoleBasedDashboard />;
  }
  
  return <Navigate to="/login" replace />;
};

const Unauthorized = () => (
  <div className="flex items-center justify-center min-h-screen bg-gray-100">
    <div className="text-center">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Unauthorized Access</h2>
      <p className="text-gray-600">You don't have permission to access this page.</p>
    </div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="/order/:restaurantSlug" element={<OrderPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;