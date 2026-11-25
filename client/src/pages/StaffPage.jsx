import { useState } from 'react';
import { UserPlus, Users } from 'lucide-react';

export default function StaffPage({ staff, onAddStaff }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('Barista');
  const [error, setError] = useState('');

  const submit = (event) => {
    event.preventDefault();
    if (!name.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return setError('Enter a name and a valid email address.');
    }
    onAddStaff({ name: name.trim(), email: email.trim().toLowerCase(), role });
    setName('');
    setEmail('');
    setRole('Barista');
    setError('');
  };

  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Manager tools / Access preview</p>
          <h1>Staff &amp; <span className="inventory-heading-word">roles</span></h1>
          <p className="page-header__subtitle">See who’s on the team and preview the two café access levels.</p>
        </div>
      </header>

      <div className="staff-role-cards">
        <article className="card staff-role-card"><span className="staff-role-card__tag">MANAGER</span><h2>Full café control</h2><p>Manage ingredients, unit costs, suppliers, staff roles, and stock-in deliveries.</p></article>
        <article className="card staff-role-card"><span className="staff-role-card__tag">BARISTA</span><h2>Daily floor access</h2><p>View ingredient stock and record stock-out usage, spoilage, and damaged packaging.</p></article>
      </div>

      <section className="card staff-list-card">
        <div className="dashboard-panel__heading"><div><p className="eyebrow">The people behind the brew</p><h2 className="card-title">Team directory</h2></div><Users size={20} aria-hidden="true" /></div>
        <div className="table-scroll">
          <table className="table">
            <thead><tr><th>Staff member</th><th>Email</th><th>Role</th><th>Status</th></tr></thead>
            <tbody>
              {staff.map((member) => <tr key={member._id}><td className="table__name">{member.name}</td><td>{member.email}</td><td><span className={`role-chip role-chip--${member.role.toLowerCase()}`}>{member.role}</span></td><td>{member.status}</td></tr>)}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card staff-add-card">
        <div className="dashboard-panel__heading"><div><p className="eyebrow">Manager only · demo</p><h2 className="card-title">Add a team member</h2></div><UserPlus size={20} aria-hidden="true" /></div>
        <form className="staff-form" onSubmit={submit}>
          <label className="form-field">Name<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required /></label>
          <label className="form-field">Email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} maxLength={254} required /></label>
          <label className="form-field">Role<select value={role} onChange={(event) => setRole(event.target.value)}><option>Barista</option><option>Manager</option></select></label>
          <button type="submit" className="btn btn--primary">Add member</button>
          {error && <p className="form-error form-error--banner" role="alert">{error}</p>}
        </form>
        <p className="demo-inline-note">This only adds a sample row. It does not create an account or password; real authentication and server-side RBAC are not included.</p>
      </section>
    </main>
  );
}
