export default function StatCard({ label, value, caption, icon: Icon }) {
  return (
    <article className="card stat-card">
      <div className="stat-card__top">
        <h2 className="stat-card__label">{label}</h2>
        <span className="icon-box" aria-hidden="true">
          <Icon size={16} />
        </span>
      </div>
      <p className="stat-card__value">{value}</p>
      <p className="stat-card__caption">{caption}</p>
    </article>
  );
}
