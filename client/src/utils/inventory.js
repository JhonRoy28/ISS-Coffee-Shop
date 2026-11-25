import { escapeCsvCell } from './csv.js';

export const STATUS = {
  IN: 'in',
  LOW: 'low',
  OUT: 'out',
};

export const STATUS_LABEL = {
  [STATUS.IN]: 'In stock',
  [STATUS.LOW]: 'Low stock',
  [STATUS.OUT]: 'Out of stock',
};

// Status is calculated from the numbers, so it never goes out of date.
export function getStatus({ quantity, reorderLevel }) {
  if (quantity <= 0) return STATUS.OUT;
  if (quantity <= reorderLevel) return STATUS.LOW;
  return STATUS.IN;
}

export function getStats(items) {
  const stats = { total: items.length, in: 0, low: 0, out: 0 };
  items.forEach((item) => {
    stats[getStatus(item)] += 1;
  });
  return stats;
}

// Out of stock items first, then low stock. The original order is kept inside each group.
export function getAlerts(items) {
  const withStatus = items.map((item) => ({ ...item, status: getStatus(item) }));
  const out = withStatus.filter((item) => item.status === STATUS.OUT);
  const low = withStatus.filter((item) => item.status === STATUS.LOW);
  return [...out, ...low];
}

export function getRecentActivities(items, limit = 5) {
  return [...items]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);
}

const numberFormat = new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 });
export const formatQuantity = (value) => numberFormat.format(value);

const dateFormat = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  year: 'numeric',
  timeZone: 'UTC',
});
export const formatDate = (value) => dateFormat.format(new Date(value));

export function createInventoryCsv(items) {
  const header = ['Item', 'SKU', 'Category', 'Quantity', 'Unit', 'Reorder level', 'Status', 'Supplier'];
  const rows = items.map((item) =>
    [item.name, item.sku, item.category, item.quantity, item.unit, item.reorderLevel, STATUS_LABEL[getStatus(item)], item.supplier]
      .map(escapeCsvCell)
      .join(',')
  );
  return [header.map(escapeCsvCell).join(','), ...rows].join('\n');
}

export function exportItemsToCsv(items) {
  const blob = new Blob([createInventoryCsv(items)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'inventory.csv';
  link.click();
  URL.revokeObjectURL(url);
}
