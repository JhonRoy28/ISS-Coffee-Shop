import { useEffect, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { Coffee, LogOut } from 'lucide-react';
import DashboardPage from './pages/DashboardPage.jsx';
import IngredientsPage from './pages/IngredientsPage.jsx';
import StockMovementsPage from './pages/StockMovementsPage.jsx';
import SuppliersPage from './pages/SuppliersPage.jsx';
import StaffPage from './pages/StaffPage.jsx';
import AuditTrailPage from './pages/AuditTrailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import SecurityPreviewPage from './pages/SecurityPreviewPage.jsx';
import {
  initialAudit,
  initialIngredients,
  initialMovements,
  initialStaff,
  initialSuppliers,
} from './data/cafeDemoData.js';

const ALL_LINKS = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/ingredients', label: 'Ingredients' },
  { path: '/movements', label: 'Stock movements' },
  { path: '/suppliers', label: 'Suppliers', managerOnly: true },
  { path: '/staff', label: 'Staff & roles', managerOnly: true },
  { path: '/audit', label: 'Audit trail' },
  { path: '/security', label: 'Threat model' },
];

function AppHeader({ user, onLogout }) {
  const links = ALL_LINKS.filter((link) => !link.managerOnly || user.role === 'Manager');

  return (
    <>
      <nav className="tab-bar" aria-label="Main navigation">
        <div className="tab-bar__links">
          {links.map(({ path, label }) => (
            <NavLink key={path} to={path} className={({ isActive }) => `tab-bar__link${isActive ? ' is-active' : ''}`}>
              {label}
            </NavLink>
          ))}
        </div>
      </nav>
      <div className="brand-bar">
        <div className="brand">
          <span className="brand__icon" aria-hidden="true"><Coffee size={18} /></span>
          <span className="brand__name"><strong>Brewstock</strong><span>CAFÉ INVENTORY</span></span>
        </div>
        <div className="account">
          <span className="account__name"><strong>{user.name}</strong><span>{user.role.toUpperCase()} · DEMO</span></span>
          <button type="button" className="logout-button" onClick={onLogout}><LogOut size={15} /> Sign out</button>
        </div>
      </div>
    </>
  );
}

function createId(prefix) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function AppRouter() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [ingredients, setIngredients] = useState(initialIngredients);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [staff, setStaff] = useState(initialStaff);
  const [movements, setMovements] = useState(initialMovements);
  const [audit, setAudit] = useState(initialAudit);

  useEffect(() => {
    document.title = `${ALL_LINKS.find((link) => link.path === location.pathname)?.label ?? 'Café Inventory'} | Brewstock`;
  }, [location.pathname]);

  const login = (role) => {
    setUser(role === 'Manager'
      ? { _id: 'demo-manager', name: 'Rashmi Santos', email: 'rashmi@brewstock.example', role: 'Manager' }
      : { _id: 'demo-barista', name: 'Abi Reyes', email: 'abi@brewstock.example', role: 'Barista' });
    navigate('/dashboard');
  };

  const logout = () => {
    setUser(null);
    navigate('/login', { replace: true });
  };

  const addAudit = (action, entity, before = null, after = null) => {
    setAudit((current) => [{
      _id: createId('audit'),
      staffName: user.name,
      role: user.role,
      action,
      entity,
      before,
      after,
      createdAt: new Date().toISOString(),
    }, ...current]);
  };

  const saveIngredient = (ingredient, values) => {
    if (user.role !== 'Manager') return;
    if (ingredient) {
      const currentExpiry = ingredient.batches?.find((batch) => batch.quantity > 0)?.expirationDate ?? null;
      const nextBatches = [...(ingredient.batches ?? [])];
      const batchIndex = nextBatches.findIndex((batch) => batch.quantity > 0);
      if (batchIndex >= 0 && values.expirationDate !== (currentExpiry ? new Date(currentExpiry).toISOString().slice(0, 10) : null)) {
        nextBatches[batchIndex] = { ...nextBatches[batchIndex], expirationDate: values.expirationDate ? new Date(values.expirationDate).toISOString() : null };
      }
      const updated = { ...ingredient, ...values, batches: nextBatches };
      setIngredients((current) => current.map((item) => item._id === ingredient._id ? updated : item));
      addAudit(`Updated ingredient ${ingredient.name}`, 'Ingredient', ingredient.name, updated.name);
      return;
    }

    const created = {
      ...values,
      _id: createId('ingredient'),
      createdAt: new Date().toISOString(),
      batches: [{ quantity: values.quantity, expirationDate: values.expirationDate ? new Date(values.expirationDate).toISOString() : null }],
    };
    setIngredients((current) => [created, ...current]);
    addAudit(`Added ingredient ${created.name}`, 'Ingredient', null, `${created.quantity} ${created.unit}`);
  };

  const deleteIngredient = (ingredient) => {
    if (user.role !== 'Manager' || !window.confirm(`Delete ${ingredient.name} from the demo catalog?`)) return;
    setIngredients((current) => current.filter((item) => item._id !== ingredient._id));
    addAudit(`Deleted ingredient ${ingredient.name}`, 'Ingredient', `${ingredient.quantity} ${ingredient.unit}`, null);
  };

  const recordMovement = ({ ingredientId, type, quantity, reason, expirationDate }) => {
    if (!user || (type === 'Stock-In' && user.role !== 'Manager')) return 'This demo role cannot record incoming stock.';
    const ingredient = ingredients.find((item) => item._id === ingredientId);
    if (!ingredient) return 'That ingredient is no longer available.';
    if (!Number.isFinite(quantity) || quantity <= 0) return 'Quantity must be greater than zero.';
    if (type === 'Stock-Out' && quantity > ingredient.quantity) return `Only ${ingredient.quantity} ${ingredient.unit} are available.`;

    const beforeQuantity = ingredient.quantity;
    const afterQuantity = type === 'Stock-In' ? beforeQuantity + quantity : beforeQuantity - quantity;
    let batches = (ingredient.batches ?? []).map((batch) => ({ ...batch }));

    if (type === 'Stock-In') {
      batches.push({ quantity, expirationDate: expirationDate ? new Date(expirationDate).toISOString() : null });
    } else {
      if (!batches.length && beforeQuantity > 0) batches = [{ quantity: beforeQuantity, expirationDate: null }];
      batches.sort((left, right) => {
        const leftDate = left.expirationDate ? new Date(left.expirationDate).getTime() : Number.MAX_SAFE_INTEGER;
        const rightDate = right.expirationDate ? new Date(right.expirationDate).getTime() : Number.MAX_SAFE_INTEGER;
        return leftDate - rightDate;
      });
      let remaining = quantity;
      for (const batch of batches) {
        const taken = Math.min(batch.quantity, remaining);
        batch.quantity -= taken;
        remaining -= taken;
        if (remaining <= 0) break;
      }
      batches = batches.filter((batch) => batch.quantity > 0);
    }

    setIngredients((current) => current.map((item) => item._id === ingredientId
      ? { ...item, quantity: afterQuantity, batches }
      : item));
    const movement = {
      _id: createId('movement'),
      ingredientName: ingredient.name,
      type,
      quantity,
      unit: ingredient.unit,
      reason,
      staffName: user.name,
      beforeQuantity,
      afterQuantity,
      createdAt: new Date().toISOString(),
    };
    setMovements((current) => [movement, ...current]);
    addAudit(
      `${type === 'Stock-In' ? 'Received' : 'Deducted'} ${quantity} ${ingredient.unit} ${ingredient.name} — ${reason}`,
      'Stock movement',
      `${beforeQuantity} ${ingredient.unit}`,
      `${afterQuantity} ${ingredient.unit}`,
    );
    return '';
  };

  const saveSupplier = (supplier, values) => {
    if (user.role !== 'Manager') return;
    if (supplier) {
      setSuppliers((current) => current.map((item) => item._id === supplier._id ? { ...item, ...values } : item));
      addAudit(`Updated supplier ${supplier.name}`, 'Supplier', supplier.name, values.name);
      return;
    }
    const created = { ...values, _id: createId('supplier') };
    setSuppliers((current) => [created, ...current]);
    addAudit(`Added supplier ${created.name}`, 'Supplier', null, created.name);
  };

  const deleteSupplier = (supplier) => {
    if (user.role !== 'Manager') return;
    if (ingredients.some((item) => item.supplier === supplier.name)) {
      window.alert('This supplier is linked to ingredients. Reassign them before deleting the supplier.');
      return;
    }
    if (!window.confirm(`Delete ${supplier.name} from the demo directory?`)) return;
    setSuppliers((current) => current.filter((item) => item._id !== supplier._id));
    addAudit(`Deleted supplier ${supplier.name}`, 'Supplier', supplier.name, null);
  };

  const addStaff = (member) => {
    if (user.role !== 'Manager') return;
    setStaff((current) => [{ ...member, _id: createId('staff'), status: 'Active' }, ...current]);
    addAudit(`Added ${member.role.toLowerCase()} ${member.name}`, 'Staff', null, member.role);
  };

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<LoginPage onLogin={login} />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    );
  }

  const manager = user.role === 'Manager';

  return (
    <>
      <div className="demo-banner"><span>DEMO MODE</span> Role controls are visual only. No backend, credentials, or security enforcement.</div>
      <AppHeader user={user} onLogout={logout} />
      <Routes>
        <Route path="/dashboard" element={<DashboardPage ingredients={ingredients} movements={movements} user={user} />} />
        <Route path="/ingredients" element={<IngredientsPage ingredients={ingredients} suppliers={suppliers} user={user} onSave={saveIngredient} onDelete={deleteIngredient} />} />
        <Route path="/movements" element={<StockMovementsPage ingredients={ingredients} movements={movements} user={user} onRecord={recordMovement} />} />
        <Route path="/suppliers" element={manager ? <SuppliersPage suppliers={suppliers} ingredients={ingredients} onSave={saveSupplier} onDelete={deleteSupplier} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/staff" element={manager ? <StaffPage staff={staff} onAddStaff={addStaff} /> : <Navigate to="/dashboard" replace />} />
        <Route path="/audit" element={<AuditTrailPage entries={audit} />} />
        <Route path="/security" element={<SecurityPreviewPage />} />
        <Route path="/login" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRouter />
    </BrowserRouter>
  );
}
