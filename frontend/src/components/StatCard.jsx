function StatCard({ title, value, subtitle }) {
  return (
    <article className="stat-card">
      <p className="typo-helper uppercase tracking-wide">{title}</p>
      <h3 className="font-heading text-3xl font-bold tracking-tight text-brand-secondary">{value}</h3>
      {subtitle ? <small className="typo-helper">{subtitle}</small> : null}
    </article>
  );
}

export default StatCard;
