import { useEffect, useState } from 'react';
import { BrowserRouter, Link, Navigate, NavLink, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import AdminUsersPage from './pages/AdminUsersPage.jsx';
import InventoryOverview from './pages/InventoryOverview.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SetupPasswordPage from './pages/SetupPasswordPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

const APP_ROUTES = [
  { path: '/inventory', label: 'Inventory', element: <InventoryOverview /> },
  { path: '/suppliers', label: 'Suppliers', element: <SuppliersPage /> },
  { path: '/reports', label: 'Reports & Analytics', element: <ReportsPage /> },
];

function AppHeader({ logoutError, onLogout }) {
  const { user } = useAuth();

  return (
    <header className="app-header">
      <nav className="tab-bar" aria-label="Main navigation">
        <div className="tab-bar__links">
          {APP_ROUTES.map(({ path, label }) => (
            <NavLink
              key={path}
              to={path}
              className={({ isActive }) => `tab-bar__link${isActive ? ' is-active' : ''}`}
            >
              {label}
            </NavLink>
          ))}
          {user?.role === 'admin' && (
            <NavLink
              to="/users"
              className={({ isActive }) => `tab-bar__link${isActive ? ' is-active' : ''}`}
            >
              User accounts
            </NavLink>
          )}
        </div>
      </nav>
      <div className="brand-bar">
        <Link className="brand" to="/inventory" aria-label="Brewstock inventory">
          <span className="brand__icon" aria-hidden="true"><Coffee size={18} /></span>
          <span className="brand__name">
            <strong>Brewstock</strong>
            <span>CAFE INVENTORY</span>
          </span>
        </Link>
        <div className="account">
          <span className="account__name">
            <strong>{user?.name}</strong>
            <span>{user?.role}</span>
          </span>
          <button type="button" className="btn btn--outline" onClick={onLogout}>Sign out</button>
        </div>
      </div>
      {logoutError && <p className="status-message status-message--error" role="alert">{logoutError}</p>}
    </header>
  );
}

function AppFrame() {
  const { pathname } = useLocation();
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');
  const activeRoute = APP_ROUTES.find(({ path }) => path === pathname);

  useEffect(() => {
    document.title = `${activeRoute?.label ?? (pathname === '/users' ? 'User accounts' : 'Inventory')} | Brewstock`;
  }, [activeRoute, pathname]);

  const handleLogout = async () => {
    setLogoutError('');
    try {
      await logout();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(error.message || 'Could not sign out. Please try again.');
    }
  };

  return (
    <>
      <AppHeader logoutError={logoutError} onLogout={handleLogout} />
      <Outlet />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/setup-password" element={<SetupPasswordPage />} />
          <Route element={<ProtectedRoute />}>
            <Route element={<AppFrame />}>
              {APP_ROUTES.map(({ path, element }) => (
                <Route key={path} path={path} element={element} />
              ))}
              <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                <Route path="/users" element={<AdminUsersPage />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/inventory" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
