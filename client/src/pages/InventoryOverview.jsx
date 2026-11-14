import { useEffect, useMemo, useState } from 'react';
import { Box, TrendingUp, TriangleAlert, X } from 'lucide-react';
import PageHeader from '../components/PageHeader.jsx';
import StatCard from '../components/StatCard.jsx';
import StockHealthChart from '../components/StockHealthChart.jsx';
import LowStockAlerts from '../components/LowStockAlerts.jsx';
import InventoryTable from '../components/InventoryTable.jsx';
import RecentActivities from '../components/RecentActivities.jsx';
import { fetchItems } from '../api/inventoryApi.js';
import { exportItemsToCsv, getAlerts, getRecentActivities, getStats } from '../utils/inventory.js';

export default function InventoryOverview() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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

  const stats = useMemo(() => getStats(items), [items]);
  const alerts = useMemo(() => getAlerts(items), [items]);
  const activities = useMemo(() => getRecentActivities(items), [items]);

  return (
    <main className="page">
      {/* onAddItem, onEdit and onDelete are connected when the backend is added. */}
      <PageHeader onExport={() => exportItemsToCsv(items)} onAddItem={() => {}} />

      {loading && <p className="status-message" role="status">Loading inventory...</p>}
      {error && <p className="status-message status-message--error" role="alert">{error}</p>}

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
          <InventoryTable items={items} />
          <RecentActivities activities={activities} />
        </>
      )}
    </main>
  );
}
