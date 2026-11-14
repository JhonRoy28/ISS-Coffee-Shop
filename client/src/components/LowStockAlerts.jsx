import { TriangleAlert } from 'lucide-react';
import CardHeader from './CardHeader.jsx';
import StatusBadge from './StatusBadge.jsx';
import { formatQuantity } from '../utils/inventory.js';

export default function LowStockAlerts({ alerts }) {
  return (
    <section className="card" aria-labelledby="alerts-title">
      <CardHeader eyebrow="Attention required" title="Low stock alerts" titleId="alerts-title">
        <span className="icon-box" aria-hidden="true">
          <TriangleAlert size={16} />
        </span>
      </CardHeader>
      {alerts.length === 0 ? (
        <p className="empty">Nothing needs restocking right now.</p>
      ) : (
        <ul className="alerts">
          {alerts.map((item) => (
            <li className="alerts__item" key={item._id}>
              <div>
                <p className="alerts__name">{item.name}</p>
                <p className="alerts__meta">
                  {formatQuantity(item.quantity)} {item.unit} remaining · reorder at {formatQuantity(item.reorderLevel)}
                </p>
              </div>
              <StatusBadge status={item.status} variant="alert" />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
