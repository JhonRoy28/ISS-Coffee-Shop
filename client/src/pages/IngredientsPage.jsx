import { useMemo, useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { ingredientCategories } from '../data/cafeDemoData.js';

const EMPTY_FORM = {
  sku: '',
  name: '',
  category: ingredientCategories[0],
  unit: 'kg',
  quantity: '',
  reorderLevel: '',
  unitCost: '',
  supplier: '',
  expirationDate: '',
};

const dateFormat = new Intl.DateTimeFormat('en-PH', { month: 'short', day: 'numeric', year: 'numeric' });
const peso = new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP', maximumFractionDigits: 2 });

function getNextExpiry(item) {
  return (item.batches ?? [])
    .filter((batch) => batch.quantity > 0 && batch.expirationDate)
    .map((batch) => new Date(batch.expirationDate))
    .sort((a, b) => a - b)[0] ?? null;
}

function IngredientDialog({ ingredient, suppliers, onClose, onSave }) {
  const [values, setValues] = useState(() => ingredient
    ? {
      sku: ingredient.sku,
      name: ingredient.name,
      category: ingredient.category,
      unit: ingredient.unit,
      quantity: ingredient.quantity,
      reorderLevel: ingredient.reorderLevel,
      unitCost: ingredient.unitCost,
      supplier: ingredient.supplier ?? '',
      expirationDate: getNextExpiry(ingredient)?.toISOString().slice(0, 10) ?? '',
    }
    : EMPTY_FORM);
  const [error, setError] = useState('');

  const setField = (event) => {
    setValues((current) => ({ ...current, [event.target.name]: event.target.value }));
    setError('');
  };

  const submit = (event) => {
    event.preventDefault();
    const quantity = Number(values.quantity);
    const reorderLevel = Number(values.reorderLevel);
    const unitCost = Number(values.unitCost);
    if (!values.sku.trim() || !values.name.trim()) return setError('Item code and name are required.');
    if (!Number.isFinite(quantity) || quantity < 0 || !Number.isFinite(reorderLevel) || reorderLevel < 0) {
      return setError('Stock and reorder level must be zero or greater.');
    }
    if (!Number.isFinite(unitCost) || unitCost < 0) return setError('Unit cost must be zero or greater.');
    if (ingredient && quantity !== ingredient.quantity) {
      return setError('Use Stock In or Stock Out to change the current quantity.');
    }
    onSave({
      ...values,
      sku: values.sku.trim().toUpperCase(),
      name: values.name.trim(),
      quantity,
      reorderLevel,
      unitCost,
      expirationDate: values.expirationDate || null,
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="supplier-dialog ingredient-dialog" role="dialog" aria-modal="true" aria-labelledby="ingredient-dialog-title">
        <div className="supplier-dialog__header">
          <div>
            <p className="eyebrow">Ingredient record</p>
            <h2 className="card-title" id="ingredient-dialog-title">{ingredient ? 'Edit ingredient' : 'Add ingredient'}</h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={18} /></button>
        </div>
        {error && <p className="form-error form-error--banner" role="alert">{error}</p>}
        <form className="supplier-form" onSubmit={submit}>
          <label className="form-field">Item code (SKU)<input name="sku" value={values.sku} onChange={setField} required maxLength={50} /></label>
          <label className="form-field">Item name<input name="name" value={values.name} onChange={setField} required maxLength={120} /></label>
          <label className="form-field">Category
            <select name="category" value={values.category} onChange={setField}>
              {ingredientCategories.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="form-field">Unit
            <select name="unit" value={values.unit} onChange={setField}>
              {['kg', 'L', 'pcs', 'cartons', 'cans', 'bottles', 'packs'].map((unit) => <option key={unit}>{unit}</option>)}
            </select>
          </label>
          <label className="form-field">Current stock
            <input type="number" name="quantity" min="0" step="0.01" value={values.quantity} onChange={setField} required disabled={Boolean(ingredient)} />
            {ingredient && <small>Use a stock movement to adjust inventory.</small>}
          </label>
          <label className="form-field">Reorder level<input type="number" name="reorderLevel" min="0" step="0.01" value={values.reorderLevel} onChange={setField} required /></label>
          <label className="form-field">Unit cost (PHP)<input type="number" name="unitCost" min="0" step="0.01" value={values.unitCost} onChange={setField} required /></label>
          <label className="form-field">Supplier
            <select name="supplier" value={values.supplier} onChange={setField}>
              <option value="">Select supplier</option>
              {suppliers.map((supplier) => <option key={supplier._id} value={supplier.name}>{supplier.name}</option>)}
            </select>
          </label>
          <label className="form-field form-field--wide">Expiration date
            <input type="date" name="expirationDate" value={values.expirationDate ?? ''} onChange={setField} />
            <small>Used for the initial batch; add future delivery dates in Stock In.</small>
          </label>
          <div className="supplier-form__actions form-field--wide">
            <button type="button" className="btn btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">{ingredient ? 'Save changes' : 'Add ingredient'}</button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default function IngredientsPage({ ingredients, suppliers, user, onSave, onDelete }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [editing, setEditing] = useState(undefined);
  const manager = user.role === 'Manager';

  const visibleIngredients = useMemo(() => {
    const term = query.trim().toLowerCase();
    return ingredients.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesQuery = !term || [item.name, item.sku, item.supplier, item.category]
        .some((value) => value?.toLowerCase().includes(term));
      return matchesCategory && matchesQuery;
    });
  }, [ingredients, category, query]);

  const save = (values) => {
    onSave(editing || null, values);
    setEditing(undefined);
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Café operations / Stock room</p>
          <h1>Ingredient <span className="inventory-heading-word">catalog</span></h1>
          <p className="page-header__subtitle">Search ingredients, check batches, and keep every shelf accounted for.</p>
        </div>
        {manager && <button type="button" className="btn btn--primary" onClick={() => setEditing(null)}><Plus size={16} /> Add ingredient</button>}
      </header>

      <section className="card table-card" aria-label="Ingredient catalog">
        <div className="toolbar ingredient-toolbar">
          <label className="search"><Search size={16} aria-hidden="true" /><input type="search" placeholder="Search name, item code, supplier..." value={query} onChange={(event) => setQuery(event.target.value)} aria-label="Search ingredients" /></label>
          <label className="select">
            <select value={category} onChange={(event) => setCategory(event.target.value)} aria-label="Filter by category">
              <option value="all">All categories</option>
              {ingredientCategories.map((name) => <option key={name}>{name}</option>)}
            </select>
          </label>
        </div>
        <div className="table-scroll">
          <table className="table ingredient-table">
            <thead>
              <tr><th>Ingredient</th><th>Category</th><th>Current stock</th><th>Next expiry</th>{manager && <th>Unit cost</th>}<th className="table__action">Status / action</th></tr>
            </thead>
            <tbody>
              {visibleIngredients.map((item) => {
                const expiry = getNextExpiry(item);
                const status = item.quantity <= 0 ? 'Out of stock' : item.quantity <= item.reorderLevel ? 'Low stock' : 'In stock';
                return (
                  <tr key={item._id}>
                    <td><p className="table__name">{item.name}</p><p className="table__sku">{item.sku} · {item.supplier || 'No supplier'}</p></td>
                    <td>{item.category}</td>
                    <td><strong className="table__qty">{item.quantity}</strong> <span className="table__unit">{item.unit}</span><p className="table__reorder">Reorder at {item.reorderLevel} {item.unit}</p></td>
                    <td>{expiry ? dateFormat.format(expiry) : '—'}</td>
                    {manager && <td>{peso.format(item.unitCost)} / {item.unit}</td>}
                    <td className="table__action">
                      <span className={`stock-label${status === 'Out of stock' ? ' stock-label--out' : status === 'In stock' ? ' stock-label--ok' : ''}`}>{status}</span>
                      {manager && <span className="ingredient-actions">
                        <button type="button" className="text-button" onClick={() => setEditing(item)}>Edit</button>
                        <button type="button" className="text-button text-button--danger" onClick={() => onDelete(item)}>Delete</button>
                      </span>}
                    </td>
                  </tr>
                );
              })}
              {visibleIngredients.length === 0 && <tr><td colSpan={manager ? 6 : 5} className="empty">No ingredients match this search.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="table-footer"><span>Showing {visibleIngredients.length} of {ingredients.length} ingredients</span><span>{manager ? 'Manager · editable catalog' : 'Barista · view only'}</span></footer>
      </section>

      {!manager && <p className="demo-inline-note">Barista demo access is view-only here. Stock-Out entries are available on the Stock Movements screen.</p>}
      {editing !== undefined && <IngredientDialog ingredient={editing} suppliers={suppliers} onClose={() => setEditing(undefined)} onSave={save} />}
    </main>
  );
}
