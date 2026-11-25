import { apiRequest } from './apiClient.js';

export const fetchItems = () => apiRequest('/api/items', {}, {
  fallbackMessage: 'Failed to fetch inventory items.',
});

export const createItem = (itemData) => apiRequest('/api/items', {
  method: 'POST',
  body: JSON.stringify(itemData),
}, {
  fallbackMessage: 'Failed to add inventory item.',
});

export const updateItem = (id, itemData) => apiRequest(`/api/items/${id}`, {
  method: 'PUT',
  body: JSON.stringify(itemData),
}, {
  fallbackMessage: 'Failed to update inventory item.',
});

export const deleteItem = (id) => apiRequest(`/api/items/${id}`, {
  method: 'DELETE',
}, {
  fallbackMessage: 'Failed to delete inventory item.',
});
