import { apiRequest } from './apiClient.js';

const request = (path, options = {}) => apiRequest(path, options, {
  fallbackMessage: 'Supplier request failed.',
});

export async function fetchSuppliers() {
  const suppliers = await request('/api/suppliers');
  if (!Array.isArray(suppliers)) {
    throw new Error('The suppliers response was not a list.');
  }
  return suppliers;
}

export async function createSupplier(values) {
  return request('/api/suppliers', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
}

export async function updateSupplier(id, values) {
  return request(`/api/suppliers/${encodeURIComponent(id)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  });
}

export async function deleteSupplier(id) {
  return request(`/api/suppliers/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}
