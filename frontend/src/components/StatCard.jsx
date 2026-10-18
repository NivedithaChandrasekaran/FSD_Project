const StatCard = ({ label, value, hint }) => (
  <div className="stat-card">
    <div className="stat-label">{label}</div>
    <div className="stat-value">{value}</div>
    {hint && <div className="stat-hint">{hint}</div>}
  </div>
);

export default StatCard;
