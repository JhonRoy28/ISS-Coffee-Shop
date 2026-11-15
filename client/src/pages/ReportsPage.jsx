import { useEffect, useMemo, useState } from 'react';
import { fetchItems } from '../api/inventoryApi.js';
import { getStats } from '../utils/inventory.js';

const formatCurrency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function ReportsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    fetchItems()
      .then((data) => active && setItems(data))
      .catch(() => active && setError('We could not load reports. Please try again.'))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []);

  const stats = useMemo(() => getStats(items), [items]);
  const inventoryValue = useMemo(
    () => items.reduce((total, item) => total + item.quantity * item.unitCost, 0),
    [items]
  );
  const categories = useMemo(() => {
    const counts = items.reduce((result, item) => {
      result.set(item.category, (result.get(item.category) ?? 0) + 1);
      return result;
    }, new Map());
    return [...counts.entries()]
      .map(([name, count]) => ({ name, count }))
      .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
  }, [items]);

  return (
    <main className="page reports-page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Insights / Live inventory</p>
          <h1>Reports &amp; Analytics</h1>
          <p className="page-header__subtitle">A live snapshot of stock health, value, and purchasing priorities.</p>
        </div>
      </header>

      {loading && <p className="status-message" role="status">Loading reports...</p>}
      {error && <p className="status-message status-message--error" role="alert">{error}</p>}
      {!loading && !error && (
        <>
          <section className="stats-grid reports-stats" aria-label="Inventory summary">
            <article className="card report-stat">
              <h2 className="report-stat__label">Total ingredients</h2>
              <p className="report-stat__value">{stats.total}</p>
            </article>
            <article className="card report-stat">
              <h2 className="report-stat__label">Inventory value</h2>
              <p className="report-stat__value">{formatCurrency.format(inventoryValue)}</p>
            </article>
            <article className="card report-stat">
              <h2 className="report-stat__label">Low stock</h2>
              <p className="report-stat__value">{stats.low}</p>
            </article>
            <article className="card report-stat">
              <h2 className="report-stat__label">Out of stock</h2>
              <p className="report-stat__value">{stats.out}</p>
            </article>
          </section>

          <div className="report-panels">
            <section className="card report-panel" aria-labelledby="report-stock-title">
              <h2 className="report-panel__title" id="report-stock-title">Stock health</h2>
              <div
                className="stock-health-bar"
                role="img"
                aria-label={`Stock health: ${stats.in} healthy, ${stats.low} low, ${stats.out} out of ${stats.total} ingredients`}
              >
                {[
                  { key: 'in', label: 'Healthy', color: 'var(--healthy)' },
                  { key: 'low', label: 'Low', color: 'var(--low)' },
                  { key: 'out', label: 'Out', color: 'var(--out)' },
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
                  { key: 'low', label: 'Low' },
                  { key: 'out', label: 'Out' },
                ].map(({ key, label }) => (
                  <div className="stock-health-count" key={key}>
                    <p className="stock-health-count__value">{stats[key]}</p>
                    <p className="stock-health-count__label">{label}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="card report-panel" aria-labelledby="report-category-title">
              <h2 className="report-panel__title" id="report-category-title">Category mix</h2>
              {categories.length ? (
                <ul className="category-list">
                  {categories.map(({ name, count }) => (
                    <li className="category-list__item" key={name}>
                      <div className="category-list__meta">
                        <span>{name}</span>
                        <strong>{count}</strong>
                      </div>
                      <div
                        className="category-list__track"
                        role="img"
                        aria-label={`${name}: ${count} of ${stats.total} ingredients`}
                      >
                        <span style={{ width: `${stats.total ? (count / stats.total) * 100 : 0}%` }} />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="report-empty">No category data available.</p>
              )}
            </section>
          </div>
        </>
      )}
    </main>
  );
}
