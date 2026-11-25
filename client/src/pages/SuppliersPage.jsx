import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Search } from 'lucide-react';
import RowActions from '../components/RowActions.jsx';
import SupplierModal from '../components/SupplierModal.jsx';
import { fetchItems } from '../api/inventoryApi.js';
import { createSupplier, deleteSupplier, fetchSuppliers, updateSupplier } from '../api/supplierApi.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function SuppliersPage() {
  const { user } = useAuth();
  const canManageSuppliers = user?.role === 'admin';
  const [suppliers, setSuppliers] = useState([]);
  const [items, setItems] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const triggerRef = useRef(null);

  useEffect(() => {
    let active = true;
    Promise.all([fetchSuppliers(), fetchItems()])
      .then(([supplierData, itemData]) => {
        if (!active) return;
        setSuppliers(supplierData);
        setItems(itemData);
      })
      .catch((loadError) => active && setError(loadError.message || 'We could not load suppliers. Please try again.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const visibleSuppliers = useMemo(() => {
    const term = query.trim().toLowerCase();
    if (!term) return suppliers;
    return suppliers.filter((supplier) =>
      [supplier.name, supplier.email, supplier.contactPerson, supplier.phone, supplier.category]
        .some((value) => value?.toLowerCase().includes(term))
    );
  }, [query, suppliers]);

  const openAdd = (event) => {
    triggerRef.current = event.currentTarget;
    setFormError('');
    setSuccess('');
    setSelectedSupplier(null);
    setShowModal(true);
  };

  const openEdit = (supplier) => (trigger) => {
    triggerRef.current = trigger;
    setFormError('');
    setSuccess('');
    setSelectedSupplier(supplier);
    setShowModal(true);
  };

  const closeModal = useCallback(() => setShowModal(false), []);

  const saveSupplier = async (values) => {
    const editing = Boolean(selectedSupplier);
    try {
      const saved = selectedSupplier
        ? await updateSupplier(selectedSupplier._id, values)
        : await createSupplier(values);
      setSuppliers((current) => selectedSupplier
        ? current.map((supplier) => supplier._id === saved._id ? saved : supplier)
        : [...current, saved]);
      setError('');
      setSuccess(editing ? 'Supplier updated successfully.' : 'Supplier added successfully.');
      setShowModal(false);
      try {
        setSuppliers(await fetchSuppliers());
      } catch (refreshError) {
        setError(`Supplier saved, but the list could not be refreshed: ${refreshError.message}`);
      }
    } catch (saveError) {
      setFormError(saveError.message || 'We could not save this supplier. Please try again.');
    }
  };

  const removeSupplier = async (supplier) => {
    if (!window.confirm(`Delete ${supplier.name}? This action cannot be undone.`)) return;
    try {
      await deleteSupplier(supplier._id);
      setSuppliers((current) => current.filter((entry) => entry._id !== supplier._id));
      setError('');
      setSuccess('Supplier deleted successfully.');
      try {
        setSuppliers(await fetchSuppliers());
      } catch (refreshError) {
        setError(`Supplier deleted, but the list could not be refreshed: ${refreshError.message}`);
      }
    } catch (deleteError) {
      setSuccess('');
      setError(deleteError.message || 'We could not delete this supplier. Please try again.');
    }
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Operations / Suppliers</p>
          <h1>Suppliers</h1>
          <p className="page-header__subtitle">Keep your cafe’s purchasing contacts in one place.</p>
        </div>
        {canManageSuppliers && (
          <div className="page-header__actions">
            <button type="button" className="btn btn--primary" onClick={openAdd}>
              Add supplier
            </button>
          </div>
        )}
      </header>

      {error && <p className="status-message status-message--error" role="alert">{error}</p>}
      {success && <p className="status-message" role="status">{success}</p>}
      {loading ? (
        <p className="status-message" role="status">Loading suppliers...</p>
      ) : suppliers.length === 0 ? (
        <section className="suppliers-empty" aria-label="No suppliers">
          No suppliers yet. Add your first purchasing partner.
        </section>
      ) : (
        <section className="card table-card" aria-label="Suppliers">
          <div className="toolbar">
            <label className="search">
              <Search size={16} aria-hidden="true" />
              <input
                type="search"
                placeholder="Search suppliers..."
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                aria-label="Search suppliers"
              />
            </label>
          </div>
          <div className="table-scroll">
            <table className="table supplier-table">
              <thead>
                <tr>
                  <th scope="col">Supplier</th>
                  <th scope="col">Contact</th>
                  <th scope="col">Category</th>
                  <th scope="col">Items</th>
                  <th scope="col">Status</th>
                  {canManageSuppliers && <th scope="col" className="table__action">Action</th>}
                </tr>
              </thead>
              <tbody>
                {visibleSuppliers.map((supplier) => (
                  <tr key={supplier._id}>
                    <td>
                      <p className="table__name">{supplier.name}</p>
                      <p className="table__sku">{supplier.email || '—'}</p>
                    </td>
                    <td>
                      <p>{supplier.contactPerson || '—'}</p>
                      <p className="table__sku">{supplier.phone || '—'}</p>
                    </td>
                    <td>{supplier.category}</td>
                    <td>{items.filter((item) => item.supplier === supplier.name).length}</td>
                    <td><span className={`supplier-status supplier-status--${supplier.status}`}>{supplier.status}</span></td>
                    {canManageSuppliers && (
                      <td className="table__action">
                        <RowActions
                          itemName={supplier.name}
                          onEdit={openEdit(supplier)}
                          onDelete={() => removeSupplier(supplier)}
                        />
                      </td>
                    )}
                  </tr>
                ))}
                {visibleSuppliers.length === 0 && (
                  <tr><td colSpan={canManageSuppliers ? 6 : 5} className="empty">No suppliers match your search.</td></tr>
                )}
              </tbody>
            </table>
          </div>
          <footer className="table-footer">
            <span>Showing {visibleSuppliers.length} of {suppliers.length} suppliers</span>
          </footer>
        </section>
      )}

      {showModal && (
        <SupplierModal
          supplier={selectedSupplier}
          triggerRef={triggerRef}
          error={formError}
          onClose={closeModal}
          onSave={saveSupplier}
        />
      )}
    </main>
  );
}
