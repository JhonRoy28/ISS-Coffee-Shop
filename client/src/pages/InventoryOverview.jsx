import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Box, TrendingUp, TriangleAlert, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StockHealthChart from '../components/StockHealthChart.jsx';
import LowStockAlerts from '../components/LowStockAlerts.jsx';
import InventoryTable from '../components/InventoryTable.jsx';
import InventoryItemModal from '../components/InventoryItemModal.jsx';
import RecentActivities from '../components/RecentActivities.jsx';
import { createItem, deleteItem, fetchItems, updateItem } from '../api/inventoryApi.js';
import { exportItemsToCsv, getAlerts, getRecentActivities, getStats } from '../utils/inventory.js';
import { useAuth } from '../context/AuthContext.jsx';

export default function InventoryOverview() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showItemModal, setShowItemModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const itemModalTriggerRef = useRef(null);
  const deleteInProgressRef = useRef(false);
  const deleteDialogRef = useRef(null);
  const deleteCancelRef = useRef(null);

  useEffect(() => {
    let active = true;
    fetchItems()
      .then((data) => active && setItems(data))
      .catch(() => active && setError('We could not load the inventory. Check your connection and try again.'))
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, []);

  const closeItemModal = useCallback(() => {
    setShowItemModal(false);
    setSelectedItem(null);
  }, []);

  const closeDeleteDialog = useCallback(() => {
    if (deleteInProgressRef.current) return;
    setDeleteTarget(null);
    setDeleteError('');
  }, []);

  useEffect(() => {
    if (!deleteTarget) return undefined;
    deleteCancelRef.current?.focus();

    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !deleteInProgressRef.current) {
        event.preventDefault();
        closeDeleteDialog();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = deleteDialogRef.current?.querySelectorAll('button:not([disabled])');
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [deleteTarget, closeDeleteDialog]);

  const handleSaveItem = async (itemData) => {
    const isEditing = Boolean(selectedItem);
    const savedItem = isEditing
      ? await updateItem(selectedItem._id, itemData)
      : await createItem(itemData);
    setShowItemModal(false);
    setSelectedItem(null);
    setItems((current) => isEditing
      ? current.map((item) => item._id === savedItem._id ? savedItem : item)
      : [savedItem, ...current.filter((item) => item._id !== savedItem._id)]);
    setFeedback({
      type: 'success',
      message: isEditing ? 'Inventory item updated successfully.' : 'Inventory item added successfully.',
    });

    try {
      setItems(await fetchItems());
    } catch (refreshError) {
      const message = refreshError instanceof Error
        ? refreshError.message
        : 'Failed to refresh inventory items.';
      setFeedback({
        type: 'error',
        message: `Item was ${isEditing ? 'updated' : 'added'}, but the inventory could not be refreshed: ${message}`,
      });
    }
  };

  const openDeleteDialog = (item) => {
    setFeedback(null);
    setDeleteError('');
    setDeleteTarget(item);
  };

  const handleDeleteItem = async () => {
    if (!deleteTarget || deleteInProgressRef.current) return;

    deleteInProgressRef.current = true;
    setDeleting(true);
    setDeleteError('');

    const itemToDelete = deleteTarget;
    try {
      await deleteItem(itemToDelete._id);
      setDeleteTarget(null);
      setItems((current) => current.filter((item) => item._id !== itemToDelete._id));
      setFeedback({ type: 'success', message: `${itemToDelete.name} was deleted successfully.` });

      try {
        setItems(await fetchItems());
      } catch (refreshError) {
        const message = refreshError instanceof Error
          ? refreshError.message
          : 'Failed to refresh inventory items.';
        setFeedback({
          type: 'error',
          message: `Item was deleted, but the inventory could not be refreshed: ${message}`,
        });
      }
    } catch (deleteError) {
      setDeleteError(deleteError instanceof Error
        ? deleteError.message
        : 'Failed to delete inventory item.');
    } finally {
      deleteInProgressRef.current = false;
      setDeleting(false);
    }
  };

  const openAddItem = (event) => {
    itemModalTriggerRef.current = event.currentTarget;
    setSelectedItem(null);
    setFeedback(null);
    setShowItemModal(true);
  };

  const openEditItem = (item, trigger) => {
    itemModalTriggerRef.current = trigger;
    setSelectedItem(item);
    setFeedback(null);
    setShowItemModal(true);
  };

  const stats = useMemo(() => getStats(items), [items]);
  const alerts = useMemo(() => getAlerts(items), [items]);
  const activities = useMemo(() => getRecentActivities(items), [items]);

  return (
    <main className="page">
      <PageHeader
        onExport={() => exportItemsToCsv(items)}
        onAddItem={openAddItem}
      />

      {loading && <p className="status-message" role="status">Loading inventory...</p>}
      {error && <p className="status-message status-message--error" role="alert">{error}</p>}
      {feedback && (
        <p
          className={feedback.type === 'error' ? 'status-message status-message--error' : 'status-message'}
          role={feedback.type === 'error' ? 'alert' : 'status'}
        >
          {feedback.message}
        </p>
      )}

      {!loading && !error && (
        <>
          <div className="stats-grid">
            <StatCard label="Total" value={stats.total} caption="Unique stock records" icon={Box} />
            <StatCard label="In stock" value={stats.in} caption="Above reorder level" icon={TrendingUp} />
            <StatCard label="Low stock" value={stats.low} caption="At or below reorder level" icon={TriangleAlert} />
            <StatCard label="Out of stock" value={stats.out} caption="Needs immediate restock" icon={X} />
          </div>
          <StockHealthChart stats={stats} />
          <LowStockAlerts alerts={alerts} />
          <InventoryTable
            items={items}
            onEdit={openEditItem}
            onDelete={openDeleteDialog}
            canDelete={user?.role === 'admin'}
          />
          <RecentActivities activities={activities} />
        </>
      )}
      {showItemModal && (
        <InventoryItemModal
          key={selectedItem?._id ?? 'new-item'}
          item={selectedItem}
          triggerRef={itemModalTriggerRef}
          onClose={closeItemModal}
          onSave={handleSaveItem}
        />
      )}
      {deleteTarget && (
        <div
          className="modal-backdrop"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeDeleteDialog();
          }}
        >
          <section
            className="supplier-dialog"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-item-title"
            aria-describedby="delete-item-description"
            ref={deleteDialogRef}
          >
            <div className="supplier-dialog__header">
              <div>
                <p className="eyebrow">Inventory</p>
                <h2 className="card-title" id="delete-item-title">Delete item</h2>
              </div>
              <button
                type="button"
                className="icon-button"
                aria-label="Close confirmation"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                ×
              </button>
            </div>
            <p id="delete-item-description">
              Delete <strong>{deleteTarget.name}</strong>? This action cannot be undone.
            </p>
            {deleteError && (
              <p className="status-message status-message--error" role="alert">{deleteError}</p>
            )}
            <div className="supplier-form__actions">
              <button
                ref={deleteCancelRef}
                type="button"
                className="btn btn--cancel"
                onClick={closeDeleteDialog}
                disabled={deleting}
              >
                Cancel
              </button>
              <button
                type="button"
                className="btn btn--primary"
                onClick={handleDeleteItem}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}
