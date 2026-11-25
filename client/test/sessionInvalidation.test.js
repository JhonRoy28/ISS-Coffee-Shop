import assert from 'node:assert/strict';
import test from 'node:test';
import {
  apiRequest,
  resetSessionInvalidation,
  subscribeToSessionInvalidation,
} from '../src/api/apiClient.js';
import { clearAuthenticatedState } from '../src/context/authState.js';
import { getLoginRedirect } from '../src/utils/authRouting.js';

const originalFetch = globalThis.fetch;

function mockResponse(status, body = {}) {
  return {
    status,
    ok: status >= 200 && status < 300,
    json: async () => body,
  };
}

function makeAuthState() {
  return {
    user: { _id: 'staff-1', role: 'staff' },
    error: '',
    loading: false,
  };
}

function bindInvalidationToState(state) {
  return subscribeToSessionInvalidation(() => {
    clearAuthenticatedState({
      setUser: (user) => { state.user = user; },
      setError: (error) => { state.error = error; },
      setLoading: (loading) => { state.loading = loading; },
    });
  });
}

test('a protected API 401 clears auth once and requests a login redirect', async () => {
  resetSessionInvalidation();
  const state = makeAuthState();
  const location = { pathname: '/inventory' };
  let invalidationCount = 0;
  const unsubscribe = subscribeToSessionInvalidation(() => {
    invalidationCount += 1;
    clearAuthenticatedState({
      setUser: (user) => { state.user = user; },
      setError: (error) => { state.error = error; },
      setLoading: (loading) => { state.loading = loading; },
    });
  });
  globalThis.fetch = async () => mockResponse(401, { message: 'Authentication required.' });

  try {
    await assert.rejects(apiRequest('/api/items'), (error) => error.status === 401);
    await assert.rejects(apiRequest('/api/suppliers'), (error) => error.status === 401);

    assert.equal(invalidationCount, 1);
    assert.equal(state.user, null);
    assert.equal(state.error, '');
    assert.equal(state.loading, false);
    assert.deepEqual(getLoginRedirect(state.user, location), {
      to: '/login',
      replace: true,
      state: { from: location },
    });
  } finally {
    unsubscribe();
    globalThis.fetch = originalFetch;
    resetSessionInvalidation();
  }
});

test('400, 403, 404, and 500 responses do not invalidate auth', async () => {
  resetSessionInvalidation();
  const state = makeAuthState();
  const unsubscribe = bindInvalidationToState(state);
  globalThis.fetch = async (path) => {
    const status = Number(path.slice('/status/'.length));
    return mockResponse(status, { message: `Request rejected (${status}).` });
  };

  try {
    for (const status of [400, 403, 404, 500]) {
      await assert.rejects(
        apiRequest(`/status/${status}`),
        (error) => error.status === status
      );
      assert.equal(state.user?._id, 'staff-1');
      assert.equal(getLoginRedirect(state.user, { pathname: '/inventory' }), null);
    }
  } finally {
    unsubscribe();
    globalThis.fetch = originalFetch;
    resetSessionInvalidation();
  }
});

test('login failures do not invalidate an existing auth context', async () => {
  resetSessionInvalidation();
  const state = makeAuthState();
  const unsubscribe = bindInvalidationToState(state);
  globalThis.fetch = async () => mockResponse(401, { message: 'Invalid email or password.' });

  try {
    await assert.rejects(
      apiRequest('/api/auth/login', {}, { requiresAuth: false }),
      (error) => error.status === 401
    );
    assert.equal(state.user?._id, 'staff-1');
  } finally {
    unsubscribe();
    globalThis.fetch = originalFetch;
    resetSessionInvalidation();
  }
});
