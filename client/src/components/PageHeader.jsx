import { Download } from 'lucide-react';

export default function PageHeader({ onExport, onAddItem }) {
  return (
    <header className="page-header">
      <div className="page-header__text">
        <p className="eyebrow">Operations / Inventory</p>
        <h1>Inventory overview</h1>
        <p className="page-header__subtitle">
          Keep an eye on stock levels, costs, and the ingredients that keep your cafe moving.
        </p>
      </div>
      <div className="page-header__actions">
        <button type="button" className="btn btn--outline" onClick={onExport}>
          <Download size={16} aria-hidden="true" />
          Export
        </button>
        <button type="button" className="btn btn--primary" onClick={onAddItem}>
          Add Item
        </button>
      </div>
    </header>
  );
}
