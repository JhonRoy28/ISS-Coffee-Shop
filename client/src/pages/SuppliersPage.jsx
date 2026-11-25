import { useState } from 'react';
import { Plus, Truck } from 'lucide-react';

const EMPTY_SUPPLIER = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  category: 'Coffee Beans',
  leadTime: 0,
  status: 'active',
  notes: '',
};

function SupplierForm({ supplier, onSave, onCancel }) {
  const [values, setValues] = useState(supplier ? { ...supplier } : { ...EMPTY_SUPPLIER });
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!values.name.trim()) return setError('Enter the supplier name.');
    if (values.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) return setError('Enter a valid email address.');
    onSave({ ...values, name: values.name.trim(), leadTime: Number(values.leadTime) || 0 });
  };

  return (
    <form className="supplier-editor" onSubmit={submit}>
      <div className="supplier-editor__heading">
        <h2 className="card-title">{supplier ? 'Edit supplier' : 'Add supplier'}</h2>
        <button type="button" className="text-button" onClick={onCancel}>Cancel</button>
      </div>
      {error && <p className="form-error form-error--banner" role="alert">{error}</p>}
      <div className="supplier-editor__fields">
        <label className="form-field">Supplier name<input value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} maxLength={120} required /></label>
        <label className="form-field">Category
          <select value={values.category} onChange={(event) => setValues({ ...values, category: event.target.value })}>
            {['Coffee Beans', 'Dairy & Alternatives', 'Syrups & Sauces', 'Packaging', 'Other'].map((category) => <option key={category}>{category}</option>)}
          </select>
        </label>
        <label className="form-field">Contact person<input value={values.contactPerson} onChange={(event) => setValues({ ...values, contactPerson: event.target.value })} /></label>
        <label className="form-field">Email<input type="email" value={values.email} onChange={(event) => setValues({ ...values, email: event.target.value })} /></label>
        <label className="form-field">Phone<input type="tel" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} /></label>
        <label className="form-field">Lead time (days)<input type="number" min="0" value={values.leadTime} onChange={(event) => setValues({ ...values, leadTime: event.target.value })} /></label>
        <label className="form-field form-field--wide">Notes<textarea rows="2" value={values.notes} onChange={(event) => setValues({ ...values, notes: event.target.value })} maxLength={1000} /></label>
      </div>
      <button className="btn btn--primary" type="submit">{supplier ? 'Save supplier' : 'Add supplier'}</button>
    </form>
  );
}

export default function SuppliersPage({ suppliers, ingredients, onSave, onDelete }) {
  const [editing, setEditing] = useState(undefined);
  const save = (values) => {
    onSave(editing || null, values);
    setEditing(undefined);
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Café operations / Partners</p>
          <h1>Supplier <span className="inventory-heading-word">directory</span></h1>
          <p className="page-header__subtitle">Keep roasters, dairy partners, and packaging vendors close at hand.</p>
        </div>
        <button type="button" className="btn btn--primary" onClick={() => setEditing(null)}><Plus size={16} /> Add supplier</button>
      </header>

      {editing !== undefined && <SupplierForm supplier={editing} onSave={save} onCancel={() => setEditing(undefined)} />}

      <section className="supplier-directory" aria-label="Suppliers">
        {suppliers.map((supplier) => {
          const suppliedItems = ingredients.filter((ingredient) => ingredient.supplier === supplier.name);
          return (
            <article className="card supplier-card" key={supplier._id}>
              <div className="supplier-card__top">
                <span className="supplier-card__icon" aria-hidden="true"><Truck size={19} /></span>
                <span className="supplier-status">{supplier.status}</span>
              </div>
              <p className="eyebrow">{supplier.category}</p>
              <h2 className="supplier-card__name">{supplier.name}</h2>
              <p className="supplier-card__contact">{supplier.contactPerson || 'Contact not added'}</p>
              <div className="supplier-card__details">
                {supplier.email && <a href={`mailto:${supplier.email}`}>{supplier.email}</a>}
                {supplier.phone && <a href={`tel:${supplier.phone}`}>{supplier.phone}</a>}
                <span>{supplier.leadTime} day{supplier.leadTime === 1 ? '' : 's'} lead time</span>
              </div>
              <div className="supplier-card__items"><strong>{suppliedItems.length}</strong> linked ingredients{suppliedItems.length > 0 && <small>{suppliedItems.map((item) => item.name).join(', ')}</small>}</div>
              <div className="supplier-card__actions">
                <button type="button" className="text-button" onClick={() => setEditing(supplier)}>Edit</button>
                <button type="button" className="text-button text-button--danger" onClick={() => onDelete(supplier)}>Delete</button>
              </div>
            </article>
          );
        })}
        {!suppliers.length && <section className="suppliers-empty">No suppliers yet. Add a café partner to get started.</section>}
      </section>
      <p className="demo-inline-note">Supplier details in this frontend demo are sample data and are not sent to a server.</p>
    </main>
  );
}
