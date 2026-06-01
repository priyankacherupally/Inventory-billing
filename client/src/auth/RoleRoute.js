import { Navigate } from 'react-router-dom';
import { useAuthStore } from './authStore.js';

/**
 * Guards a route by role. Renders children only if the logged-in user's role
 * is in `allow`; otherwise redirects to the dashboard.
 */
export default function RoleRoute({ allow, children }) {
  const role = useAuthStore((s) => s.user?.role);
  if (!allow.includes(role)) {
    return <Navigate to="/dashboard" replace />;
  }
  return children;
}