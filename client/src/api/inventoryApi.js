import { mockItems } from '../data/mockItems.js';

// For now this returns sample data. When the Express API is ready, replace the
// body with:  const res = await fetch('/api/items'); return res.json();
export async function fetchItems() {
  return mockItems;
}
