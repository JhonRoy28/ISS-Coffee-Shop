import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';

export default function LoginPage() {
  const { user, loading, login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (loading) return <p className="status-message" role="status">Checking your session...</p>;
  if (user) return <Navigate to="/inventory" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await login(email, password);
      const destination = location.state?.from?.pathname || '/inventory';
      navigate(destination, { replace: true });
    } catch (loginError) {
      setError(loginError.message || 'Unable to sign in.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card" aria-labelledby="login-title">
        <p className="eyebrow">Brewstock</p>
        <h1 className="card-title" id="login-title">Sign in</h1>
        <p className="page-header__subtitle">Sign in to manage cafe inventory.</p>
        {error && <p className="status-message status-message--error" role="alert">{error}</p>}
        <form className="auth-form" onSubmit={submit}>
          <label className="form-field">
            Email
            <input
              type="email"
              name="email"
              autoComplete="username"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              maxLength={254}
            />
          </label>
          <label className="form-field">
            Password
            <input
              type="password"
              name="password"
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              maxLength={128}
            />
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </section>
    </main>
  );
}
