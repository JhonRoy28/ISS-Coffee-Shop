import { useEffect, useMemo, useState } from 'react';
import { ChevronDown, Download } from 'lucide-react';
import { fetchItems } from '../api/inventoryApi.js';
import { fetchSuppliers } from '../api/supplierApi.js';
import { getStats, getStatus, STATUS } from '../utils/inventory.js';
import { createReportCsv, filterReportItems, getCategoryCounts } from '../utils/reports.js';

const formatCurrency = new Intl.NumberFormat('en-PH', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPeso = (value) => `₱${formatCurrency.format(value)}`;

const STOCK_STATUS_OPTIONS = [
  { value: 'all', label: 'All stock statuses' },
  { value: STATUS.IN, label: 'Healthy' },
  { value: STATUS.LOW, label: 'Low Stock' },
  { value: STATUS.OUT, label: 'Out of Stock' },
];

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [supplierLoading, setSupplierLoading] = useState(true);
  const [inventoryError, setInventoryError] = useState('');
  const [supplierError, setSupplierError] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    let active = true;

    fetchItems()
      .then((data) => {
        if (active) setItems(data);
      })
      .catch((error) => {
        if (active) setInventoryError(error.message || 'We could not load inventory reports.');
      })
      .finally(() => {
        if (active) setInventoryLoading(false);
      });

    fetchSuppliers()
      .then((data) => {
        if (active) setSuppliers(data);
      })
      .catch((error) => {
        if (active) setSupplierError(error.message || 'We could not load supplier reports.');
      })
      .finally(() => {
        if (active) setSupplierLoading(false);
      });

    return () => { active = false; };
  }, []);

  const categoriesInInventory = useMemo(() => getCategoryCounts(items), [items]);
  const filteredItems = useMemo(
    () => filterReportItems(items, categoryFilter, statusFilter),
    [items, categoryFilter, statusFilter]
  );
  const stats = useMemo(() => getStats(filteredItems), [filteredItems]);
  const inventoryValue = useMemo(
    () => filteredItems.reduce((total, item) => total + Number(item.quantity) * Number(item.unitCost), 0),
    [filteredItems]
  );
  const categories = useMemo(() => getCategoryCounts(filteredItems), [filteredItems]);
  const supplierStats = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter((supplier) => supplier.status === 'active').length,
    inactive: suppliers.filter((supplier) => supplier.status === 'inactive').length,
  }), [suppliers]);

  const exportCsv = () => {
    const csv = createReportCsv(filteredItems);
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'brewstock-inventory-report.csv';
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="page reports-page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Insights / Live inventory</p>
          <h1>Reports &amp; Analytics</h1>
          <p className="page-header__subtitle">A live snapshot of stock health, value, and purchasing priorities.</p>
        </div>
        <div className="page-header__actions">
          <button
            type="button"
            className="btn btn--outline"
            onClick={exportCsv}
            disabled={inventoryLoading || Boolean(inventoryError) || filteredItems.length === 0}
          >
            <Download size={16} aria-hidden="true" />
            Export CSV
          </button>
        </div>
      </header>

      {inventoryLoading && <p className="status-message" role="status">Loading inventory reports...</p>}
      {inventoryError && <p className="status-message status-message--error" role="alert">{inventoryError}</p>}

      {!inventoryLoading && !inventoryError && (
        <>
          <section className="card report-panel" aria-label="Inventory report filters">
            <div className="toolbar">
              <p className="report-panel__title">Inventory filters</p>
              <label className="select">
                <select
                  value={categoryFilter}
                  onChange={(event) => setCategoryFilter(event.target.value)}
                  aria-label="Filter by inventory category"
                >
                  <option value="all">All categories</option>
                  {categoriesInInventory.map(({ name }) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </label>
              <label className="select">
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  aria-label="Filter by stock status"
                >
                  {STOCK_STATUS_OPTIONS.map(({ value, label }) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
                <ChevronDown size={16} aria-hidden="true" />
              </label>
              <span className="table-footer__source">Filters apply to inventory summaries and CSV export.</span>
            </div>
          </section>

          <section className="stats-grid reports-stats" aria-label="Filtered inventory summary">
            <article className="card report-stat">
              <h2 className="report-stat__label">Total inventory items</h2>
              <p className="report-stat__value">{stats.total}</p>
            </article>
            <article className="card report-stat">
              <h2 className="report-stat__label">Inventory value</h2>
              <p className="report-stat__value">{formatPeso(inventoryValue)}</p>
            </article>
            <article className="card report-stat">
              <h2 className="report-stat__label">Low-stock items</h2>
              <p className="report-stat__value">{stats.low}</p>
            </article>
            <article className="card report-stat">
              <h2 className="report-stat__label">Out-of-stock items</h2>
              <p className="report-stat__value">{stats.out}</p>
            </article>
          </section>

          {filteredItems.length === 0 && (
            <p className="report-empty" role="status">
              {items.length === 0
                ? 'No inventory items are available.'
                : 'No inventory items match the selected filters.'}
            </p>
          )}

          <div className="report-panels">
            <section className="card report-panel" aria-labelledby="report-stock-title">
              <h2 className="report-panel__title" id="report-stock-title">Stock health</h2>
              <div
                className="stock-health-bar"
                role="img"
                aria-label={`Stock health: ${stats.in} healthy, ${stats.low} low, ${stats.out} out of ${stats.total} inventory items`}
              >
                {[
                  { key: 'in', label: 'Healthy', color: 'var(--healthy)' },
                  { key: 'low', label: 'Low stock', color: 'var(--low)' },
                  { key: 'out', label: 'Out of stock', color: 'var(--out)' },
                ].map((segment) => (
                  <span
                    className="stock-health-bar__segment"
                    key={segment.key}
                    style={{
                      width: `${stats.total ? (stats[segment.key] / stats.total) * 100 : 0}%`,
                      backgroundColor: segment.color,
                    }}
                    aria-label={`${segment.label}: ${stats[segment.key]}`}
                  />
                ))}
              </div>
              <div className="stock-health-counts">
                {[
                  { key: 'in', label: 'Healthy' },
                  { key: 'low', label: 'Low stock' },
                  { key: 'out', label: 'Out of stock' },
                ].map(({ key, label }) => (
                  <div className="stock-health-count" key={key}>
                    <p className="stock-health-count__value">{stats[key]}</p>
                    <p className="stock-health-count__label">{label}</p>
                  </div>
                ))}
              </div>
              <p className="report-empty">
                {stats.in + stats.low + stats.out} of {stats.total} filtered items classified.
              </p>
            </section>

            <section className="card report-panel" aria-labelledby="report-category-title">
              <h2 className="report-panel__title" id="report-category-title">Category analysis</h2>
              {categories.length ? (
                <ul className="category-list">
                  {categories.map(({ name, count }) => (
                    <li className="category-list__item" key={name}>
                      <div className="category-list__meta">
                        <span>{name}</span>
                        <strong>{count} {count === 1 ? 'item' : 'items'}</strong>
                      </div>
                      <div
                        className="category-list__track"
                        role="img"
                        aria-label={`${name}: ${count} of ${stats.total} filtered items`}
                      >
                        <span style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="report-empty">No category data for the selected filters.</p>
              )}
            </section>

            <section className="card report-panel" aria-labelledby="report-suppliers-title">
              <h2 className="report-panel__title" id="report-suppliers-title">Supplier summary</h2>
              {supplierLoading ? (
                <p className="status-message" role="status">Loading suppliers...</p>
              ) : supplierError ? (
                <p className="status-message status-message--error" role="alert">{supplierError}</p>
              ) : (
                <>
                  <div className="stock-health-counts">
                    {[
                      { key: 'total', label: 'Total suppliers' },
                      { key: 'active', label: 'Active' },
                      { key: 'inactive', label: 'Inactive' },
                    ].map(({ key, label }) => (
                      <div className="stock-health-count" key={key}>
                        <p className="stock-health-count__value">{supplierStats[key]}</p>
                        <p className="stock-health-count__label">{label}</p>
                      </div>
                    ))}
                  </div>
                  {supplierStats.total === 0 && (
                    <p className="report-empty">No suppliers are available.</p>
                  )}
                </>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
