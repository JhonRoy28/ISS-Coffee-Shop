import { STATUS, STATUS_LABEL } from '../utils/inventory.js';

// variant "table" shows a small dot, variant "alert" is a plain pill.
export default function StatusBadge({ status, variant = 'table' }) {
  const classes = ['badge', `badge--${status}`, variant === 'table' ? 'badge--dot' : ''].join(' ').trim();
  return (
    <span className={classes}>
      {variant === 'table' && <span className="badge__dot" aria-hidden="true" />}
      {STATUS_LABEL[status] ?? STATUS_LABEL[STATUS.IN]}
    </span>
  );
}
