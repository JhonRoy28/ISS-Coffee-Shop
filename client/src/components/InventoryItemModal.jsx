import { useEffect, useRef, useState } from 'react';

const EMPTY_VALUES = {
  name: '',
  sku: '',
  category: '',
  quantity: '',
  unit: '',
  unitCost: '',
  reorderLevel: '',
  supplier: '',
};

const REQUIRED_FIELDS = {
  name: 'Enter an item name.',
  sku: 'Enter an SKU.',
  category: 'Enter a category.',
  quantity: 'Enter a quantity.',
  unit: 'Enter a unit.',
  unitCost: 'Enter a unit cost.',
  reorderLevel: 'Enter a reorder level.',
};

const NUMERIC_FIELDS = ['quantity', 'unitCost', 'reorderLevel'];

function getInitialValues(item) {
  if (!item) return { ...EMPTY_VALUES };

  return {
    name: item.name ?? '',
    sku: item.sku ?? '',
    category: item.category ?? '',
    quantity: item.quantity == null ? '' : String(item.quantity),
    unit: item.unit ?? '',
    unitCost: item.unitCost == null ? '' : String(item.unitCost),
    reorderLevel: item.reorderLevel == null ? '' : String(item.reorderLevel),
    supplier: item.supplier ?? '',
  };
}

function validate(values) {
  const errors = {};

  Object.entries(REQUIRED_FIELDS).forEach(([field, message]) => {
    if (!values[field].trim()) errors[field] = message;
  });

  NUMERIC_FIELDS.forEach((field) => {
    if (!values[field].trim()) return;

    const number = Number(values[field]);
    if (!Number.isFinite(number)) {
      errors[field] = 'Enter a valid number.';
    } else if (number < 0) {
      errors[field] = 'Enter a number that is zero or greater.';
    }
  });

  return errors;
}

export default function InventoryItemModal({ item, triggerRef, onClose, onSave }) {
  const [values, setValues] = useState(() => getInitialValues(item));
  const [errors, setErrors] = useState({});
  const [saveError, setSaveError] = useState('');
  const [saving, setSaving] = useState(false);
  const dialogRef = useRef(null);
  const nameInputRef = useRef(null);
  const savingRef = useRef(false);

  useEffect(() => {
    nameInputRef.current?.focus();
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !savingRef.current) {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== 'Tab') return;

      const focusable = dialogRef.current?.querySelectorAll(
        'button:not([disabled]), input:not([disabled])'
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
    setSaveError('');
  };

  const submit = async (event) => {
    event.preventDefault();
    if (savingRef.current) return;

    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    savingRef.current = true;
    setSaving(true);
    setSaveError('');

    try {
      await onSave({
        name: values.name.trim(),
        sku: values.sku.trim(),
        category: values.category.trim(),
        quantity: Number(values.quantity),
        unit: values.unit.trim(),
        unitCost: Number(values.unitCost),
        reorderLevel: Number(values.reorderLevel),
        supplier: values.supplier.trim(),
      });
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Failed to add inventory item.');
    } finally {
      savingRef.current = false;
      setSaving(false);
    }
  };

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !savingRef.current) onClose();
      }}
    >
      <section
        className="supplier-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="inventory-item-dialog-title"
        ref={dialogRef}
      >
        <div className="supplier-dialog__header">
          <div>
            <p className="eyebrow">Stock record</p>
            <h2 className="card-title" id="inventory-item-dialog-title">
              {item ? 'Edit Item' : 'Add inventory item'}
            </h2>
          </div>
          <button
            type="button"
            className="icon-button"
            aria-label="Close dialog"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>
        {saveError && <p className="status-message status-message--error" role="alert">{saveError}</p>}
        <form className="supplier-form" onSubmit={submit} noValidate>
          <label className="form-field">
            Item name <span aria-hidden="true">*</span>
            <input
              ref={nameInputRef}
              name="name"
              value={values.name}
              onChange={updateField}
              aria-invalid={Boolean(errors.name)}
              aria-describedby={errors.name ? 'inventory-name-error' : undefined}
              disabled={saving}
            />
            {errors.name && <span className="form-error" id="inventory-name-error">{errors.name}</span>}
          </label>
          <label className="form-field">
            SKU <span aria-hidden="true">*</span>
            <input
              name="sku"
              value={values.sku}
              onChange={updateField}
              aria-invalid={Boolean(errors.sku)}
              aria-describedby={errors.sku ? 'inventory-sku-error' : undefined}
              disabled={saving}
            />
            {errors.sku && <span className="form-error" id="inventory-sku-error">{errors.sku}</span>}
          </label>
          <label className="form-field">
            Category <span aria-hidden="true">*</span>
            <input
              name="category"
              value={values.category}
              onChange={updateField}
              aria-invalid={Boolean(errors.category)}
              aria-describedby={errors.category ? 'inventory-category-error' : undefined}
              disabled={saving}
            />
            {errors.category && <span className="form-error" id="inventory-category-error">{errors.category}</span>}
          </label>
          <label className="form-field">
            Quantity <span aria-hidden="true">*</span>
            <input
              type="number"
              min="0"
              step="any"
              name="quantity"
              value={values.quantity}
              onChange={updateField}
              aria-invalid={Boolean(errors.quantity)}
              aria-describedby={errors.quantity ? 'inventory-quantity-error' : undefined}
              disabled={saving}
            />
            {errors.quantity && <span className="form-error" id="inventory-quantity-error">{errors.quantity}</span>}
          </label>
          <label className="form-field">
            Unit <span aria-hidden="true">*</span>
            <input
              name="unit"
              value={values.unit}
              onChange={updateField}
              aria-invalid={Boolean(errors.unit)}
              aria-describedby={errors.unit ? 'inventory-unit-error' : undefined}
              disabled={saving}
            />
            {errors.unit && <span className="form-error" id="inventory-unit-error">{errors.unit}</span>}
          </label>
          <label className="form-field">
            Unit cost <span aria-hidden="true">*</span>
            <input
              type="number"
              min="0"
              step="any"
              name="unitCost"
              value={values.unitCost}
              onChange={updateField}
              aria-invalid={Boolean(errors.unitCost)}
              aria-describedby={errors.unitCost ? 'inventory-unit-cost-error' : undefined}
              disabled={saving}
            />
            {errors.unitCost && <span className="form-error" id="inventory-unit-cost-error">{errors.unitCost}</span>}
          </label>
          <label className="form-field">
            Reorder level <span aria-hidden="true">*</span>
            <input
              type="number"
              min="0"
              step="any"
              name="reorderLevel"
              value={values.reorderLevel}
              onChange={updateField}
              aria-invalid={Boolean(errors.reorderLevel)}
              aria-describedby={errors.reorderLevel ? 'inventory-reorder-level-error' : undefined}
              disabled={saving}
            />
            {errors.reorderLevel && <span className="form-error" id="inventory-reorder-level-error">{errors.reorderLevel}</span>}
          </label>
          <label className="form-field form-field--wide">
            Supplier
            <input
              name="supplier"
              value={values.supplier}
              onChange={updateField}
              disabled={saving}
            />
          </label>
          <div className="supplier-form__actions form-field--wide">
            <button type="button" className="btn btn--cancel" onClick={onClose} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={saving}>
              {saving ? 'Saving...' : item ? 'Save Changes' : 'Add item'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
