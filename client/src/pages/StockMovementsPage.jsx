import { useMemo, useState } from 'react';
import { ArrowDownToLine, ArrowUpFromLine, ClipboardList } from 'lucide-react';

const dateTimeFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

export default function StockMovementsPage({ ingredients, movements, user, onRecord }) {
  const canReceive = user.role === 'Manager';
  const [type, setType] = useState(canReceive ? 'Stock-In' : 'Stock-Out');
  const [ingredientId, setIngredientId] = useState(ingredients[0]?._id ?? '');
  const [quantity, setQuantity] = useState('');
  const [reason, setReason] = useState(canReceive ? 'Supplier Delivery' : 'Daily Usage');
  const [expirationDate, setExpirationDate] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const reasons = type === 'Stock-In'
    ? ['Supplier Delivery', 'Opening Stock', 'Return to Stock']
    : ['Daily Usage', 'Spoilage', 'Expired Product', 'Damaged Packaging'];

  const visibleMovements = useMemo(() => movements, [movements]);

  const changeType = (event) => {
    const nextType = event.target.value;
    setType(nextType);
    setReason(nextType === 'Stock-In' ? 'Supplier Delivery' : 'Daily Usage');
    setError('');
    setSuccess('');
  };

  const submit = (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    const amount = Number(quantity);
    if (!ingredientId) return setError('Choose an ingredient first.');
    if (!Number.isFinite(amount) || amount <= 0) return setError('Enter a quantity greater than zero.');
    if (type === 'Stock-In' && !canReceive) return setError('Only a Manager can log incoming stock.');
    if (type === 'Stock-In' && expirationDate && new Date(expirationDate) < new Date(new Date().toDateString())) {
      return setError('The batch expiration date cannot be in the past.');
    }

    const result = onRecord({ ingredientId, type, quantity: amount, reason, expirationDate: expirationDate || null });
    if (result) return setError(result);
    setSuccess(`${type} recorded. The demo stock and activity logs have been updated.`);
    setQuantity('');
    setExpirationDate('');
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Café operations / Daily ledger</p>
          <h1>Stock <span className="inventory-heading-word">movements</span></h1>
          <p className="page-header__subtitle">Record deliveries, barista pulls, spoilage, and packaging damage.</p>
        </div>
      </header>

      <section className="stock-workspace">
        <div className="card stock-entry-card">
          <div className="dashboard-panel__heading">
            <div><p className="eyebrow">Make an entry</p><h2 className="card-title">Log stock movement</h2></div>
            <ClipboardList size={20} aria-hidden="true" />
          </div>
          <form className="movement-form" onSubmit={submit}>
            <label className="form-field">Movement type
              <select value={type} onChange={changeType}>
                {canReceive && <option>Stock-In</option>}
                <option>Stock-Out</option>
              </select>
            </label>
            <label className="form-field">Ingredient
              <select value={ingredientId} onChange={(event) => setIngredientId(event.target.value)} required>
                {ingredients.map((item) => <option value={item._id} key={item._id}>{item.name} · {item.quantity} {item.unit}</option>)}
              </select>
            </label>
            <label className="form-field">Quantity
              <input type="number" min="0.01" step="0.01" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="e.g. 2" required />
            </label>
            <label className="form-field">Reason
              <select value={reason} onChange={(event) => setReason(event.target.value)}>
                {reasons.map((item) => <option key={item}>{item}</option>)}
              </select>
            </label>
            {type === 'Stock-In' && (
              <label className="form-field form-field--wide">Batch expiration date <span className="field-optional">Optional for non-perishables</span>
                <input type="date" value={expirationDate} onChange={(event) => setExpirationDate(event.target.value)} />
              </label>
            )}
            {error && <p className="form-error form-error--banner form-field--wide" role="alert">{error}</p>}
            {success && <p className="form-success form-field--wide" role="status">{success}</p>}
            <div className="movement-form__actions form-field--wide">
              <button type="submit" className="btn btn--primary">
                {type === 'Stock-In' ? <ArrowDownToLine size={16} /> : <ArrowUpFromLine size={16} />}
                Record {type}
              </button>
            </div>
          </form>
          <p className="demo-inline-note">Frontend demo only · server-side validation and role enforcement are not active.</p>
        </div>

        <section className="card movement-history-card" aria-labelledby="movement-history-title">
          <div className="dashboard-panel__heading">
            <div><p className="eyebrow">Who moved what</p><h2 className="card-title" id="movement-history-title">Movement history</h2></div>
          </div>
          <div className="table-scroll">
            <table className="table movement-table">
              <thead><tr><th>Ingredient / reason</th><th>Action</th><th>Change</th><th>Before → after</th><th>Staff / time</th></tr></thead>
              <tbody>
                {visibleMovements.map((movement) => {
                  const isIn = movement.type === 'Stock-In';
                  return (
                    <tr key={movement._id}>
                      <td><p className="table__name">{movement.ingredientName}</p><p className="table__sku">{movement.reason}</p></td>
                      <td><span className={`movement-type${isIn ? ' movement-type--in' : ' movement-type--out'}`}>{movement.type}</span></td>
                      <td><strong>{isIn ? '+' : '−'}{movement.quantity} {movement.unit}</strong></td>
                      <td>{movement.beforeQuantity} → {movement.afterQuantity} {movement.unit}</td>
                      <td><p>{movement.staffName}</p><p className="table__sku">{dateTimeFormat.format(new Date(movement.createdAt))}</p></td>
                    </tr>
                  );
                })}
                {!visibleMovements.length && <tr><td className="empty" colSpan={5}>No movements have been logged.</td></tr>}
              </tbody>
            </table>
          </div>
          <footer className="table-footer"><span>{visibleMovements.length} recorded movements</span><span>Read-only history</span></footer>
        </section>
      </section>
    </main>
  );
}
