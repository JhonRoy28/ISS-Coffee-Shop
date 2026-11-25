import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getLoginRedirect } from '../utils/authRouting.js';

export default function ProtectedRoute({ allowedRoles }) {
  const { user, loading, error, refreshUser } = useAuth();
  const location = useLocation();

  if (loading) {
    return <p className="status-message" role="status">Checking your session...</p>;
  }
  if (error) {
    return (
      <main className="page">
        <p className="status-message status-message--error" role="alert">{error}</p>
        <button type="button" className="btn btn--outline" onClick={refreshUser}>Retry</button>
      </main>
    );
  }
  const loginRedirect = getLoginRedirect(user, location);
  if (loginRedirect) return <Navigate {...loginRedirect} />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/inventory" replace />;
  }
  return <Outlet />;
}
