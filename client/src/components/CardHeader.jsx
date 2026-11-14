export default function CardHeader({ eyebrow, title, titleId, children, bordered = false }) {
  return (
    <div className={`card-header${bordered ? ' card-header--bordered' : ''}`}>
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="card-title" id={titleId}>{title}</h2>
      </div>
      {children}
    </div>
  );
}
