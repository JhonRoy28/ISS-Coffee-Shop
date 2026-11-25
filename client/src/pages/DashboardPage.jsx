import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, CalendarClock, PhilippinePeso } from 'lucide-react';

const peso = new Intl.NumberFormat('en-PH', {
  style: 'currency',
  currency: 'PHP',
  maximumFractionDigits: 0,
});

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric' });

function isExpiringSoon(ingredient) {
  return (ingredient.batches ?? []).some((batch) => {
    if (!batch.expirationDate || batch.quantity <= 0) return false;
    const daysLeft = (new Date(batch.expirationDate).getTime() - Date.now()) / 86400000;
    return daysLeft >= 0 && daysLeft <= 7;
  });
}

export default function DashboardPage({ ingredients, movements, user }) {
  const lowStock = ingredients.filter((item) => item.quantity <= item.reorderLevel);
  const expiring = ingredients.filter(isExpiringSoon);
  const inStockCount = ingredients.filter((item) => item.quantity > 0).length;
  const inventoryValue = ingredients.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  const stats = [
    { label: 'Ingredients in stock', value: inStockCount.toLocaleString('en-PH'), caption: `${ingredients.length} cataloged ingredients`, icon: Boxes },
    { label: 'Low-stock alerts', value: lowStock.length, caption: 'Needs a reorder check', icon: AlertTriangle, tone: 'gold' },
    { label: 'Expiring this week', value: expiring.length, caption: 'Check the next 7 days', icon: CalendarClock },
    { label: 'Inventory value', value: peso.format(inventoryValue), caption: 'Estimated on-hand value', icon: PhilippinePeso },
  ];

  return (
    <main className="page dashboard-page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Your café / Daily snapshot</p>
          <h1>Good day, <span className="inventory-heading-word">{user.name.split(' ')[0]}</span></h1>
          <p className="page-header__subtitle">A fresh look at what’s on the shelf and what needs attention.</p>
        </div>
        <span className="role-chip">{user.role} view</span>
      </header>

      <section className="cafe-stats-grid" aria-label="Inventory summary">
        {stats.map(({ label, value, caption, icon: Icon, tone }) => (
          <article className={`card cafe-stat${tone ? ` cafe-stat--${tone}` : ''}`} key={label}>
            <div className="cafe-stat__top">
              <p className="cafe-stat__label">{label}</p>
              <span className="cafe-stat__icon" aria-hidden="true"><Icon size={18} /></span>
            </div>
            <p className="cafe-stat__value">{value}</p>
            <p className="cafe-stat__caption">{caption}</p>
          </article>
        ))}
      </section>

      <div className="dashboard-panels">
        <section className="card dashboard-panel" aria-labelledby="low-stock-title">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Needs a little love</p>
              <h2 className="card-title" id="low-stock-title">Low-stock shelf</h2>
            </div>
            <span className="count-stamp">{lowStock.length}</span>
          </div>
          {lowStock.length ? (
            <ul className="notice-list">
              {lowStock.slice(0, 5).map((item) => (
                <li className="notice-row" key={item._id}>
                  <span><strong>{item.name}</strong><small>{item.quantity} {item.unit} on hand · reorder at {item.reorderLevel}</small></span>
                  <span className={`stock-label${item.quantity <= 0 ? ' stock-label--out' : ''}`}>{item.quantity <= 0 ? 'Out' : 'Low'}</span>
                </li>
              ))}
            </ul>
          ) : <p className="empty">Everything is stocked up.</p>}
        </section>

        <section className="card dashboard-panel" aria-labelledby="expiring-title">
          <div className="dashboard-panel__heading">
            <div>
              <p className="eyebrow">Freshness first</p>
              <h2 className="card-title" id="expiring-title">Expiring soon</h2>
            </div>
            <CalendarClock size={19} aria-hidden="true" />
          </div>
          {expiring.length ? (
            <ul className="notice-list">
              {expiring.slice(0, 5).map((item) => {
                const nextExpiry = item.batches
                  .filter((batch) => batch.quantity > 0 && batch.expirationDate)
                  .map((batch) => new Date(batch.expirationDate))
                  .sort((a, b) => a - b)[0];
                return (
                  <li className="notice-row" key={item._id}>
                    <span><strong>{item.name}</strong><small>{item.quantity} {item.unit} · {item.supplier || 'No supplier'}</small></span>
                    <span className="expiry-date">{nextExpiry ? dateFormat.format(nextExpiry) : '—'}</span>
                  </li>
                );
              })}
            </ul>
          ) : <p className="empty">No batches expiring in the next 7 days.</p>}
        </section>
      </div>

      <section className="card dashboard-panel movement-preview" aria-labelledby="movement-preview-title">
        <div className="dashboard-panel__heading">
          <div>
            <p className="eyebrow">Today at the café</p>
            <h2 className="card-title" id="movement-preview-title">Recent stock movement</h2>
          </div>
        </div>
        {movements.length ? (
          <ul className="movement-preview-list">
            {movements.slice(0, 4).map((movement) => {
              const isIn = movement.type === 'Stock-In';
              const Icon = isIn ? ArrowDownToLine : ArrowUpFromLine;
              return (
                <li key={movement._id}>
                  <span className={`movement-preview__icon${isIn ? ' is-in' : ' is-out'}`} aria-hidden="true"><Icon size={16} /></span>
                  <span className="movement-preview__copy"><strong>{movement.ingredientName}</strong><small>{movement.reason} · {movement.staffName}</small></span>
                  <span className="movement-preview__quantity">{isIn ? '+' : '−'}{movement.quantity} {movement.unit}</span>
                </li>
              );
            })}
          </ul>
        ) : <p className="empty">No stock movements recorded yet.</p>}
      </section>

      <p className="demo-inline-note">Demo data only · totals are calculated in your browser and reset when this page is refreshed.</p>
    </main>
  );
}
