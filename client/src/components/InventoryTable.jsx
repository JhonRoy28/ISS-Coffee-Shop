import { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import CardHeader from './CardHeader.jsx';
import StatusBadge from './StatusBadge.jsx';
import RowActions from './RowActions.jsx';
import { formatQuantity, getStatus } from '../utils/inventory.js';

export default function InventoryTable({ items, onEdit, onDelete, canDelete = true }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');

  const categories = useMemo(() => [...new Set(items.map((item) => item.category))].sort(), [items]);

  const visibleItems = useMemo(() => {
    const term = query.trim().toLowerCase();
    return items.filter((item) => {
      const matchesCategory = category === 'all' || item.category === category;
      const matchesSearch =
        !term || [item.name, item.sku, item.supplier].some((field) => field?.toLowerCase().includes(term));
      return matchesCategory && matchesSearch;
    });
  }, [items, query, category]);

  return (
    <section className="card table-card" aria-labelledby="inventory-table-title">
      <CardHeader eyebrow="Stock records" title="Inventory table" titleId="inventory-table-title" bordered />

      <div className="toolbar">
        <label className="search">
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            placeholder="Search items, SKUs, or suppliers..."
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            aria-label="Search items, SKUs, or suppliers"
          />
        </label>
        <label className="select">
          <select
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            aria-label="Filter by category"
          >
            <option value="all">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <ChevronDown size={16} aria-hidden="true" />
        </label>
      </div>

      <div className="table-scroll">
        <table className="table">
          <colgroup>
            <col style={{ width: '34%' }} />
            <col style={{ width: '25%' }} />
            <col style={{ width: '16%' }} />
            <col style={{ width: '15%' }} />
            <col style={{ width: '10%' }} />
          </colgroup>
          <thead>
            <tr>
              <th scope="col">Item</th>
              <th scope="col">Category</th>
              <th scope="col">Stock</th>
              <th scope="col">Status</th>
              <th scope="col" className="table__action">Action</th>
            </tr>
          </thead>
          <tbody>
            {visibleItems.map((item) => (
              <tr key={item._id}>
                <td>
                  <p className="table__name">{item.name}</p>
                  <p className="table__sku">{item.sku}</p>
                </td>
                <td>{item.category}</td>
                <td>
                  <p>
                    <strong className="table__qty">{formatQuantity(item.quantity)}</strong>{' '}
                    <span className="table__unit">{item.unit}</span>
                  </p>
                  <p className="table__reorder">Reorder at {formatQuantity(item.reorderLevel)}</p>
                </td>
                <td><StatusBadge status={getStatus(item)} /></td>
                <td className="table__action">
                  <RowActions
                    itemName={item.name}
                    onEdit={(trigger) => onEdit?.(item, trigger)}
                    onDelete={canDelete ? () => onDelete?.(item) : undefined}
                    canDelete={canDelete}
                  />
                </td>
              </tr>
            ))}
            {visibleItems.length === 0 && (
              <tr>
                <td colSpan={5} className="empty">No items match your search. Try a different name, SKU, or category.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <footer className="table-footer">
        <span>Showing {visibleItems.length} of {items.length} items</span>
        <span className="table-footer__source">
          Live data from MongoDB <ChevronRight size={14} aria-hidden="true" />
        </span>
      </footer>
    </section>
  );
}
