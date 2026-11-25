import { getStatus, STATUS } from './inventory.js';
import { escapeCsvCell } from './csv.js';

const STATUS_LABELS = {
  [STATUS.IN]: 'Healthy',
  [STATUS.LOW]: 'Low Stock',
  [STATUS.OUT]: 'Out of Stock',
};

const categoryName = (item) => item.category?.trim() || 'Uncategorized';

export function filterReportItems(items, category = 'all', status = 'all') {
  return items.filter((item) => (
    (category === 'all' || categoryName(item) === category)
    && (status === 'all' || getStatus(item) === status)
  ));
}

export function getCategoryCounts(items) {
  const counts = items.reduce((result, item) => {
    const name = categoryName(item);
    result.set(name, (result.get(name) || 0) + 1);
    return result;
  }, new Map());

  return [...counts.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((left, right) => right.count - left.count || left.name.localeCompare(right.name));
}

export function createReportCsv(items) {
  const header = [
    'Item name',
    'SKU',
    'Category',
    'Quantity',
    'Unit',
    'Unit cost',
    'Inventory value',
    'Reorder level',
    'Supplier',
    'Stock status',
  ];
  const rows = items.map((item) => [
    item.name,
    item.sku,
    categoryName(item),
    item.quantity,
    item.unit,
    item.unitCost,
    Number(item.quantity) * Number(item.unitCost),
    item.reorderLevel,
    item.supplier,
    STATUS_LABELS[getStatus(item)],
  ]);

  return [header, ...rows]
    .map((row) => row.map(escapeCsvCell).join(','))
    .join('\r\n');
}
