import { apiRequest } from './apiClient.js';

const request = (path, options = {}) => apiRequest(path, options, {
  fallbackMessage: 'Account request failed.',
});

export const fetchStaff = () => request('/api/users');

export const createStaff = (values) => request('/api/users', {
  method: 'POST',
  body: JSON.stringify(values),
});

export const updateStaff = (id, values) => request(`/api/users/${encodeURIComponent(id)}`, {
  method: 'PATCH',
  body: JSON.stringify(values),
});

export const setStaffActive = (id, isActive) => request(`/api/users/${encodeURIComponent(id)}/status`, {
  method: 'PATCH',
  body: JSON.stringify({ isActive }),
});

export const createSetupInvite = (id) => request(`/api/users/${encodeURIComponent(id)}/setup-invite`, {
  method: 'POST',
});
