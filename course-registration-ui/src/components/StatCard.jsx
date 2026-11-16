import Icon from './Icon.jsx'

function StatCard({ label, value, detail, icon, variant = '' }) {
  return (
    <article className="stat-card">
      <div className={`stat-icon ${variant}`}><Icon name={icon} size={20} /></div>
      <div className="stat-copy">
        <span className="stat-label">{label}</span>
        <strong className="stat-value">{value}</strong>
        <span className="stat-detail">{detail}</span>
      </div>
    </article>
  )
}

export default StatCard
