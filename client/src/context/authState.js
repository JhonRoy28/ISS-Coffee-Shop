export function clearAuthenticatedState({ setUser, setError, setLoading }) {
  setUser(null);
  setError('');
  setLoading(false);
}
