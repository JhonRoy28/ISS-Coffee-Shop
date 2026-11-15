import { useEffect } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation } from 'react-router-dom';
import { Coffee } from 'lucide-react';
import InventoryOverview from './pages/InventoryOverview.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import ReportsPage from './pages/ReportsPage.jsx';

const APP_ROUTES = [
  { path: '/inventory', label: 'Inventory', element: <InventoryOverview /> },
  { path: '/suppliers', label: 'Suppliers', element: <SuppliersPage /> },
  { path: '/reports', label: 'Reports & Analytics', element: <ReportsPage /> },
];

function AppHeader() {
  const { pathname } = useLocation();

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
        </div>
      </nav>
      {pathname === '/inventory' && (
        <div className="brand-bar">
          <div className="brand">
            <span className="brand__icon" aria-hidden="true"><Coffee size={18} /></span>
            <span className="brand__name">
              <strong>Brewstock</strong>
              <span>CAFE INVENTORY</span>
            </span>
          </div>
          <div className="account">
            <span className="account__name">
              <strong>National University</strong>
              <span>ACCOUNT</span>
            </span>
            <span className="account__avatar">
              <span aria-hidden="true">NU</span>
            </span>
          </div>
        </div>
      )}
    </header>
  );
}

function RoutedApp() {
  const { pathname } = useLocation();
  const activeRoute = APP_ROUTES.find(({ path }) => path === pathname);

  useEffect(() => {
    document.title = `${activeRoute?.label ?? 'Inventory'} | Brewstock`;
  }, [activeRoute]);

  return (
    <>
      <AppHeader />
      <Routes>
        {APP_ROUTES.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        <Route path="*" element={<Navigate to="/inventory" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <RoutedApp />
    </BrowserRouter>
  );
}
