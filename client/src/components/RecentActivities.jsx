import { Plus } from 'lucide-react';
import CardHeader from './CardHeader.jsx';
import { formatDate, formatQuantity } from '../utils/inventory.js';

export default function RecentActivities({ activities }) {
  return (
    <section className="card" aria-labelledby="activities-title">
      <CardHeader eyebrow="Latest updates" title="Recent inventory activities" titleId="activities-title" />
      <ul className="activities">
        {activities.map((item) => (
          <li className="activities__row" key={item._id}>
            <span className="activities__icon" aria-hidden="true"><Plus size={16} /></span>
            <div className="activities__text">
              <p className="activities__title">Added {item.name}</p>
              <p className="activities__meta">
                {formatQuantity(item.quantity)} {item.unit} on hand · {item.category}
              </p>
            </div>
            <time className="activities__date" dateTime={item.createdAt}>{formatDate(item.createdAt)}</time>
          </li>
        ))}
      </ul>
    </section>
  );
}
