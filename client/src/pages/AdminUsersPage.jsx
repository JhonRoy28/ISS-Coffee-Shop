import { useCallback, useEffect, useState } from 'react';
import {
  createSetupInvite,
  createStaff,
  fetchStaff,
  setStaffActive,
  updateStaff,
} from '../api/userApi.js';

export default function AdminUsersPage() {
  const [staff, setStaff] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [workingId, setWorkingId] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [setupUrl, setSetupUrl] = useState('');
  const [editingId, setEditingId] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const loadStaff = useCallback(async () => {
    setLoading(true);
    try {
      setStaff(await fetchStaff());
      setError('');
    } catch (loadError) {
      setError(loadError.message || 'Could not load Staff accounts.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStaff();
  }, [loadStaff]);

  const createAccount = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError('');
    setSuccess('');
    setSetupUrl('');
    try {
      const result = await createStaff({ name, email });
      setStaff((current) => [result.user, ...current]);
      setSetupUrl(result.setupUrl);
      setSuccess('Staff account created. Share the one-time setup link with the account holder.');
      setName('');
      setEmail('');
    } catch (createError) {
      setError(createError.message || 'Could not create the account.');
    } finally {
      setSubmitting(false);
    }
  };

  const beginEdit = (account) => {
    setEditingId(account._id);
    setEditName(account.name);
    setEditEmail(account.email);
    setError('');
    setSuccess('');
  };

  const saveEdit = async (accountId) => {
    setWorkingId(accountId);
    setError('');
    setSuccess('');
    try {
      const result = await updateStaff(accountId, { name: editName, email: editEmail });
      setStaff((current) => current.map((account) => account._id === accountId ? result.user : account));
      setEditingId('');
      setSuccess('Staff account updated.');
    } catch (updateError) {
      setError(updateError.message || 'Could not update the Staff account.');
    } finally {
      setWorkingId('');
    }
  };

  const toggleActive = async (account) => {
    setWorkingId(account._id);
    setError('');
    setSuccess('');
    try {
      const result = await setStaffActive(account._id, !account.isActive);
      setStaff((current) => current.map((entry) => entry._id === account._id ? result.user : entry));
      setSuccess(`Staff account ${result.user.isActive ? 'activated' : 'deactivated'}.`);
    } catch (statusError) {
      setError(statusError.message || 'Could not change the account status.');
    } finally {
      setWorkingId('');
    }
  };

  const sendSetupInvite = async (account) => {
    setWorkingId(account._id);
    setError('');
    setSuccess('');
    setSetupUrl('');
    try {
      const result = await createSetupInvite(account._id);
      setSetupUrl(result.setupUrl);
      setSuccess(`A new one-time password setup link was created for ${account.name}.`);
    } catch (inviteError) {
      setError(inviteError.message || 'Could not create a setup link.');
    } finally {
      setWorkingId('');
    }
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Administration / Access</p>
          <h1>User accounts</h1>
          <p className="page-header__subtitle">Create and manage Staff access to Brewstock.</p>
        </div>
      </header>

      {error && <p className="status-message status-message--error" role="alert">{error}</p>}
      {success && <p className="status-message" role="status">{success}</p>}
      {setupUrl && (
        <section className="card setup-link-card" aria-label="One-time account setup link">
          <label className="form-field">
            One-time setup link
            <input type="url" readOnly value={setupUrl} onFocus={(event) => event.target.select()} />
          </label>
          <p className="table-footer__source">Share securely with the account holder. This link expires in 24 hours and can be used once.</p>
        </section>
      )}

      <section className="card user-admin-card" aria-labelledby="create-account-title">
        <h2 className="report-panel__title" id="create-account-title">Create account</h2>
        <form className="user-admin-form" onSubmit={createAccount}>
          <label className="form-field">
            Full name
            <input value={name} onChange={(event) => setName(event.target.value)} required maxLength={120} />
          </label>
          <label className="form-field">
            Email
            <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required maxLength={254} />
          </label>
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create account'}
          </button>
        </form>
      </section>

      <section className="card table-card user-admin-card" aria-labelledby="staff-list-title">
        <div className="card-header card-header--bordered">
          <div>
            <p className="eyebrow">Access management</p>
            <h2 className="card-title" id="staff-list-title">Staff accounts</h2>
          </div>
        </div>
        {loading ? (
          <p className="status-message" role="status">Loading accounts...</p>
        ) : staff.length === 0 ? (
          <p className="empty">No Staff accounts have been created.</p>
        ) : (
          <div className="table-scroll">
            <table className="table user-admin-table">
              <thead>
                <tr>
                  <th scope="col">Name</th>
                  <th scope="col">Email</th>
                  <th scope="col">Account</th>
                  <th scope="col">Password setup</th>
                  <th scope="col" className="table__action">Actions</th>
                </tr>
              </thead>
              <tbody>
                {staff.map((account) => {
                  const editing = editingId === account._id;
                  const working = workingId === account._id;
                  return (
                    <tr key={account._id}>
                      <td>
                        {editing
                          ? <input aria-label={`Edit name for ${account.email}`} value={editName} onChange={(event) => setEditName(event.target.value)} maxLength={120} />
                          : <span className="table__name">{account.name}</span>}
                      </td>
                      <td>
                        {editing
                          ? <input aria-label={`Edit email for ${account.name}`} type="email" value={editEmail} onChange={(event) => setEditEmail(event.target.value)} maxLength={254} />
                          : account.email}
                      </td>
                      <td>{account.isActive ? 'Active' : 'Inactive'}</td>
                      <td>{account.needsPasswordSetup ? 'Pending' : 'Complete'}</td>
                      <td className="table__action user-admin-actions">
                        {editing ? (
                          <>
                            <button type="button" className="btn btn--outline" onClick={() => saveEdit(account._id)} disabled={working || !editName.trim() || !editEmail.trim()}>
                              {working ? 'Saving...' : 'Save'}
                            </button>
                            <button type="button" className="btn btn--cancel" onClick={() => setEditingId('')} disabled={working}>Cancel</button>
                          </>
                        ) : (
                          <>
                            <button type="button" className="btn btn--outline" onClick={() => beginEdit(account)} disabled={working}>Edit</button>
                            <button type="button" className="btn btn--outline" onClick={() => toggleActive(account)} disabled={working}>
                              {working ? 'Saving...' : account.isActive ? 'Deactivate' : 'Activate'}
                            </button>
                            {account.needsPasswordSetup && account.isActive && (
                              <button type="button" className="btn btn--cancel" onClick={() => sendSetupInvite(account)} disabled={working}>
                                {working ? 'Creating link...' : 'New setup link'}
                              </button>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <footer className="table-footer">
          <span>{staff.length} Staff account{staff.length === 1 ? '' : 's'}</span>
          <button type="button" className="btn btn--outline" onClick={loadStaff} disabled={loading}>Refresh</button>
        </footer>
      </section>
    </main>
  );
}
