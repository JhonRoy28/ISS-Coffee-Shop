import CardHeader from './CardHeader.jsx';

const ROWS = [
  { key: 'in', label: 'In stock', color: 'var(--primary)' },
  { key: 'low', label: 'Low stock', color: 'var(--gold)' },
  { key: 'out', label: 'Out of stock', color: 'var(--navy)' },
];

export default function StockHealthChart({ stats }) {
  // Bars are sized against the biggest group so the longest bar always fills the track.
  const max = Math.max(stats.in, stats.low, stats.out, 1);

  return (
    <section className="card" aria-labelledby="stock-chart-title">
      <CardHeader eyebrow="Stock health" title="Stock level chart" titleId="stock-chart-title">
        <span className="pill pill--soft">{stats.total} total</span>
      </CardHeader>
      <ul className="chart">
        {ROWS.map(({ key, label, color }) => (
          <li className="chart__row" key={key}>
            <span className="chart__label">{label}</span>
            <div
              className="chart__track"
              role="img"
              aria-label={`${label}: ${stats[key]} of ${stats.total} items`}
            >
              <div
                className="chart__fill"
                style={{ width: `${(stats[key] / max) * 100}%`, background: color }}
              />
            </div>
            <span className="chart__count">{stats[key]}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
