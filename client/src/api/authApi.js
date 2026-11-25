import { apiRequest } from './apiClient.js';

export const getCurrentUser = () => apiRequest('/api/auth/me', {}, {
  fallbackMessage: 'Could not verify the current session.',
});

export const signIn = (email, password) => apiRequest('/api/auth/login', {
  method: 'POST',
  body: JSON.stringify({ email, password }),
}, {
  requiresAuth: false,
  fallbackMessage: 'Authentication request failed.',
});

export const signOut = () => apiRequest('/api/auth/logout', {
  method: 'POST',
}, {
  requiresAuth: false,
  fallbackMessage: 'Could not sign out.',
});

export const completePasswordSetup = (token, password) => apiRequest('/api/auth/setup-password', {
  method: 'POST',
  body: JSON.stringify({ token, password }),
}, {
  requiresAuth: false,
  fallbackMessage: 'Password setup failed.',
});
