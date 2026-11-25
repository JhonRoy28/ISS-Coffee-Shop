const sessionInvalidationListeners = new Set();
let sessionInvalidationNotified = false;

export function subscribeToSessionInvalidation(listener) {
  sessionInvalidationListeners.add(listener);
  return () => sessionInvalidationListeners.delete(listener);
}

export function resetSessionInvalidation() {
  sessionInvalidationNotified = false;
}

function notifySessionInvalidation() {
  if (sessionInvalidationNotified) return;
  sessionInvalidationNotified = true;
  sessionInvalidationListeners.forEach((listener) => listener());
}

export async function apiRequest(path, options = {}, {
  requiresAuth = true,
  fallbackMessage,
} = {}) {
  const response = await fetch(path, {
    ...options,
    credentials: 'include',
    headers: options.body
      ? { 'Content-Type': 'application/json', ...options.headers }
      : options.headers,
  });

  if (requiresAuth && response.status === 401) {
    notifySessionInvalidation();
  }

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(
      data.message || fallbackMessage || `API request failed (${response.status}).`
    );
    error.status = response.status;
    throw error;
  }
  return data;
}
