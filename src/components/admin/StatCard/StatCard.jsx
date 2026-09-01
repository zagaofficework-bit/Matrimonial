import './StatCard.css';

export default function StatCard({ label, value, hint, tone = 'default', icon }) {
  return (
    <div className={`stat-card tone-${tone}`}>
      {icon && <div className="stat-card-icon">{icon}</div>}
      <div>
        <p className="stat-card-label">{label}</p>
        <p className="stat-card-value">{value}</p>
        {hint && <p className="stat-card-hint">{hint}</p>}
      </div>
    </div>
  );
}
