import { Routes, Route, Navigate } from 'react-router-dom';

import ProtectedRoute from './auth/ProtectedRoute.js';
import RoleRoute from './auth/RoleRoute.js';
import { ROLES } from './config/apiConfig.js';
import MainLayout from './layouts/MainLayout.js';
import DashboardPage from './pages/DashboardPage.js';
import UsersPage from './pages/UsersPage.js';
import CataloguePage from './pages/CataloguePage.js';
import SuppliersPage from './pages/SuppliersPage.js';
import PurchasePage from './pages/PurchasePage.js';
import BillingPage from './pages/BillingPage.js';
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
        {/* Billing — accessible to both Admin and Billing Executive */}
        <Route path="/billing" element={<BillingPage />} />
        <Route
          path="/catalogue"
          element={
            <RoleRoute allow={[ROLES.ADMIN]}>
              <CataloguePage />
            </RoleRoute>
          }
        />
        <Route
          path="/suppliers"
          element={
            <RoleRoute allow={[ROLES.ADMIN]}>
              <SuppliersPage />
            </RoleRoute>
          }
        />
        <Route
          path="/purchase"
          element={
            <RoleRoute allow={[ROLES.ADMIN]}>
              <PurchasePage />
            </RoleRoute>
          }
        />
        <Route
          path="/users"
          element={
            <RoleRoute allow={[ROLES.ADMIN]}>
              <UsersPage />
            </RoleRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}