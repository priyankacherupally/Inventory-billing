import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './auth/ProtectedRoute.js';
import MainLayout from './layouts/MainLayout.js';
import DashboardPage from './pages/DashboardPage.js';
import LoginPage from './pages/LoginPage.js';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
