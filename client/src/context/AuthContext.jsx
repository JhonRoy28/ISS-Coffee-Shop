import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/authApi.js';
import { resetSessionInvalidation, subscribeToSessionInvalidation } from '../api/apiClient.js';
import { clearAuthenticatedState } from './authState.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const clearAuth = useCallback(() => {
    clearAuthenticatedState({ setUser, setError, setLoading });
  }, []);

  useEffect(() => subscribeToSessionInvalidation(clearAuth), [clearAuth]);

  const refreshUser = useCallback(async () => {
    setLoading(true);
    try {
      const result = await authApi.getCurrentUser();
      setUser(result.user);
      setError('');
    } catch (requestError) {
      if (requestError.status === 401) {
        setUser(null);
        setError('');
      } else {
        setUser(null);
        setError(requestError.message || 'Could not verify the current session.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = async (email, password) => {
    const result = await authApi.signIn(email, password);
    resetSessionInvalidation();
    setUser(result.user);
    setError('');
    return result.user;
  };

  const logout = async () => {
    try {
      await authApi.signOut();
    } finally {
      clearAuth();
    }
  };

  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    logout,
    refreshUser,
  }), [user, loading, error, login, logout, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider.');
  return context;
}
