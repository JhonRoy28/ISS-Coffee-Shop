import { ShieldAlert, ShieldCheck } from 'lucide-react';

const THREATS = [
  {
    name: 'Spoofing',
    scenario: 'A barista uses a manager’s stolen password to approve a fake write-off.',
    mitigation: 'Hash passwords with bcrypt and lock accounts after five failed sign-ins.',
  },
  {
    name: 'Tampering',
    scenario: 'A modified Stock-Out request sends a negative quantity, or a name contains script markup.',
    mitigation: 'Validate positive quantities on the server and safely encode user-entered text.',
  },
  {
    name: 'Repudiation',
    scenario: 'A staff member removes coffee stock and claims they never changed the record.',
    mitigation: 'Write staff ID, action, timestamp, and before/after values to an append-only audit log.',
  },
  {
    name: 'Information disclosure',
    scenario: 'An injection in search exposes supplier costs, or response headers reveal server details.',
    mitigation: 'Use parameterized database queries and suppress server/version headers.',
  },
  {
    name: 'Denial of service',
    scenario: 'Automated requests overwhelm sign-in or ingredient search during a busy service.',
    mitigation: 'Apply server-side rate limits to authentication and search endpoints.',
  },
  {
    name: 'Elevation of privilege',
    scenario: 'A Barista opens a Manager screen or sends a delete request directly to the API.',
    mitigation: 'Enforce role-based authorization on every protected server route.',
  },
];

export default function SecurityPreviewPage() {
  return (
    <main className="page">
      <header className="page-header">
        <div className="page-header__text">
          <p className="eyebrow">Project notes / Security design</p>
          <h1>Threat <span className="inventory-heading-word">model</span></h1>
          <p className="page-header__subtitle">Café-specific STRIDE scenarios and the controls planned for a secured backend.</p>
        </div>
        <span className="security-status"><ShieldAlert size={16} /> Planned controls</span>
      </header>

      <aside className="security-disclaimer">
        <ShieldCheck size={18} aria-hidden="true" />
        <p><strong>Frontend-only preview.</strong> The mitigations below are design requirements, not controls implemented by this prototype. Do not send real credentials or inventory data.</p>
      </aside>

      <section className="card threat-card" aria-label="STRIDE threat model">
        <div className="table-scroll">
          <table className="table threat-table">
            <thead><tr><th>STRIDE threat</th><th>Café attack scenario</th><th>Planned mitigation</th></tr></thead>
            <tbody>
              {THREATS.map(({ name, scenario, mitigation }) => (
                <tr key={name}>
                  <td><span className="threat-name">{name}</span></td>
                  <td>{scenario}</td>
                  <td>{mitigation}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card zap-guide">
        <p className="eyebrow">Local security testing plan</p>
        <h2 className="card-title">OWASP ZAP before and after hardening</h2>
        <div className="zap-guide__columns">
          <article>
            <span className="zap-step">01 · Baseline</span>
            <h3>Scan your local demo</h3>
            <p>Run a baseline scan only against an application you own, such as your local frontend and API. Record missing-header and cookie findings; this frontend-only demo has no API to scan yet.</p>
          </article>
          <article>
            <span className="zap-step">02 · Harden</span>
            <h3>Implement server controls</h3>
            <p>Add security headers, server-side validation, protected sessions, rate limits, and role checks in the backend before treating any finding as resolved.</p>
          </article>
          <article>
            <span className="zap-step">03 · Compare</span>
            <h3>Repeat the same scan</h3>
            <p>Re-run the same authorized scan against the hardened local environment and compare alerts. A clean frontend build is not evidence that the backend is secure.</p>
          </article>
        </div>
      </section>
    </main>
  );
}
