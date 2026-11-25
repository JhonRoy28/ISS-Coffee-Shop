import { LockKeyhole } from 'lucide-react';

const dateTimeFormat = new Intl.DateTimeFormat('en-PH', { dateStyle: 'medium', timeStyle: 'short' });

export default function AuditTrailPage({ entries }) {
  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Accountability / Read-only</p>
          <h1>Audit <span className="inventory-heading-word">trail</span></h1>
          <p className="page-header__subtitle">A demo history of who changed stock and what the quantities were before and after.</p>
        </div>
        <span className="audit-readonly"><LockKeyhole size={15} /> Read only</span>
      </header>
      <section className="card audit-card" aria-label="Audit history">
        <div className="table-scroll">
          <table className="table audit-table">
            <thead><tr><th>Timestamp</th><th>Staff member</th><th>Action</th><th>Record</th><th>Before</th><th>After</th></tr></thead>
            <tbody>
              {entries.map((entry) => (
                <tr key={entry._id}>
                  <td>{dateTimeFormat.format(new Date(entry.createdAt))}</td>
                  <td><p className="table__name">{entry.staffName}</p><p className="table__sku">{entry.role}</p></td>
                  <td>{entry.action}</td>
                  <td>{entry.entity}</td>
                  <td>{entry.before ?? '—'}</td>
                  <td>{entry.after ?? '—'}</td>
                </tr>
              ))}
              {!entries.length && <tr><td className="empty" colSpan={6}>No activity recorded yet.</td></tr>}
            </tbody>
          </table>
        </div>
        <footer className="table-footer"><span>{entries.length} demo audit entries</span><span>Sample-only · not immutable or server-backed</span></footer>
      </section>
      <aside className="audit-note"><strong>Production note:</strong> this screen displays editable browser demo data. An immutable audit trail requires server-side authorization and append-only database records, which are outside this frontend-only build.</aside>
    </main>
  );
}
