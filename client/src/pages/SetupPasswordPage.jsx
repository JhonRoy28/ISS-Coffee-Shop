import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { completePasswordSetup } from '../api/authApi.js';

export default function SetupPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') || '';
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');
    if (!token) {
      setError('This password setup link is invalid or expired.');
      return;
    }
    if (password.length < 12 || password.length > 128) {
      setError('Choose a password between 12 and 128 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await completePasswordSetup(token, password);
      setSuccess(result.message);
      setPassword('');
      setConfirmation('');
    } catch (setupError) {
      setError(setupError.message || 'Unable to set the password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <section className="card auth-card" aria-labelledby="setup-title">
        <p className="eyebrow">Account setup</p>
        <h1 className="card-title" id="setup-title">Set your password</h1>
        <p className="page-header__subtitle">Use a unique password with at least 12 characters.</p>
        {error && <p className="status-message status-message--error" role="alert">{error}</p>}
        {success && <p className="status-message" role="status">{success}</p>}
        {!success && (
          <form className="auth-form" onSubmit={submit}>
            <label className="form-field">
              New password
              <input
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={12}
                maxLength={128}
              />
            </label>
            <label className="form-field">
              Confirm password
              <input
                type="password"
                autoComplete="new-password"
                value={confirmation}
                onChange={(event) => setConfirmation(event.target.value)}
                required
                minLength={12}
                maxLength={128}
              />
            </label>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Saving password...' : 'Set password'}
            </button>
          </form>
        )}
        {success && <Link className="btn btn--outline auth-link" to="/login">Go to sign in</Link>}
      </section>
    </main>
  );
}
