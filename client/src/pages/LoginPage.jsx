import { useState } from 'react';
import { Coffee, ShieldCheck } from 'lucide-react';

export default function LoginPage({ onLogin }) {
  const [role, setRole] = useState('Manager');

  const submit = (event) => {
    event.preventDefault();
    onLogin(role);
  };

  return (
    <main className="login-page">
      <section className="login-card">
        <div className="login-brand">
          <span className="login-brand__icon" aria-hidden="true"><Coffee size={23} /></span>
          <span className="login-brand__name">Brewstock</span>
          <span className="login-brand__tag">CAFÉ INVENTORY</span>
        </div>
        <p className="eyebrow">Good to see you</p>
        <h1>Welcome back.</h1>
        <p className="login-intro">Sign in to keep the café running smoothly.</p>

        <form className="login-form" onSubmit={submit}>
          <label className="form-field">Work email<input type="email" placeholder="you@yourcafe.com" autoComplete="username" required /></label>
          <label className="form-field">Password<input type="password" placeholder="Enter any demo password" autoComplete="current-password" required /></label>
          <label className="form-field">Demo role
            <select value={role} onChange={(event) => setRole(event.target.value)}>
              <option>Manager</option>
              <option>Barista</option>
            </select>
          </label>
          <button type="submit" className="btn btn--primary login-submit">Continue as {role}</button>
        </form>

        <aside className="demo-security-note">
          <ShieldCheck size={17} aria-hidden="true" />
          <p><strong>Frontend demo only.</strong> The email and password are not checked or stored. This only previews role-specific screens; there is no bcrypt, server session, or backend authorization.</p>
        </aside>
      </section>
      <p className="login-caption">COME FOR THE BREW, STAY FOR THE VIBES</p>
    </main>
  );
}
