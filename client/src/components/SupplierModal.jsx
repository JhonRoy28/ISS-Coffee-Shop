import { useEffect, useRef, useState } from 'react';
import { SUPPLIER_CATEGORIES } from '../data/mockSuppliers.js';

const EMPTY_FORM = {
  name: '',
  contactPerson: '',
  email: '',
  phone: '',
  category: SUPPLIER_CATEGORIES[0],
  leadTime: '',
  status: 'active',
  notes: '',
};

function validate(values) {
  const errors = {};
  if (!values.name.trim()) errors.name = 'Enter a supplier name.';
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  if (values.leadTime !== '' && (!Number.isFinite(Number(values.leadTime)) || Number(values.leadTime) < 0)) {
    errors.leadTime = 'Enter a number of days that is zero or greater.';
  }
  return errors;
}

export default function SupplierModal({ supplier, triggerRef, error, onClose, onSave }) {
  const [values, setValues] = useState(() => supplier
    ? { ...EMPTY_FORM, ...supplier, leadTime: supplier.leadTime ?? '' }
    : EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    nameInputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled])'
      );
      if (!focusable?.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      triggerRef.current?.focus();
    };
  }, [onClose, triggerRef]);

  const updateField = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: '' }));
  };

  const submit = async (event) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    setSaving(true);
    try {
      await onSave({
        ...values,
        name: values.name.trim(),
        email: values.email.trim(),
        leadTime: values.leadTime === '' ? '' : Number(values.leadTime),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => event.target === event.currentTarget && onClose()}
    >
      <section
        className="supplier-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-dialog-title"
        ref={dialogRef}
      >
        <div className="supplier-dialog__header">
          <div>
            <p className="eyebrow">Supplier details</p>
            <h2 className="card-title" id="supplier-dialog-title">
              {supplier ? 'Edit supplier' : 'Add supplier'}
            </h2>
          </div>
          <button type="button" className="icon-button" aria-label="Close dialog" onClick={onClose}>×</button>
        </div>
        {error && <p className="status-message status-message--error" role="alert">{error}</p>}
        <form className="supplier-form" onSubmit={submit} noValidate>
          <label className="form-field form-field--wide">
            Supplier name <span aria-hidden="true">*</span>
            <input ref={nameInputRef} name="name" value={values.name} onChange={updateField} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'supplier-name-error' : undefined} />
            {errors.name && <span className="form-error" id="supplier-name-error">{errors.name}</span>}
          </label>
          <label className="form-field">
            Contact person
            <input name="contactPerson" value={values.contactPerson} onChange={updateField} />
          </label>
          <label className="form-field">
            Email
            <input type="email" name="email" value={values.email} onChange={updateField} aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'supplier-email-error' : undefined} />
            {errors.email && <span className="form-error" id="supplier-email-error">{errors.email}</span>}
          </label>
          <label className="form-field">
            Phone
            <input type="tel" name="phone" value={values.phone} onChange={updateField} />
          </label>
          <label className="form-field">
            Category
            <select name="category" value={values.category} onChange={updateField}>
              {SUPPLIER_CATEGORIES.map((category) => <option key={category}>{category}</option>)}
            </select>
          </label>
          <label className="form-field">
            Lead time (days)
            <input type="number" min="0" name="leadTime" value={values.leadTime} onChange={updateField} aria-invalid={Boolean(errors.leadTime)} aria-describedby={errors.leadTime ? 'supplier-lead-time-error' : undefined} />
            {errors.leadTime && <span className="form-error" id="supplier-lead-time-error">{errors.leadTime}</span>}
          </label>
          <label className="form-field">
            Status
            <select name="status" value={values.status} onChange={updateField}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </label>
          <label className="form-field form-field--wide">
            Notes
            <textarea name="notes" rows="3" value={values.notes} onChange={updateField} />
          </label>
          <div className="supplier-form__actions form-field--wide">
            <button type="button" className="btn btn--cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : supplier ? 'Save changes' : 'Add supplier'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
