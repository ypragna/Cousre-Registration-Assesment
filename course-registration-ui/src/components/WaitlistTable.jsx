import Icon from './Icon.jsx'

function WaitlistTable({ learnerIds, loading }) {
  return (
    <section className="panel table-panel waitlist-panel" id="waitlist" aria-labelledby="waitlist-heading">
      <div className="panel-heading table-heading">
        <div><div className="eyebrow">FIFO QUEUE</div><h2 id="waitlist-heading">Waitlist</h2></div>
        <span className="count-badge">{Array.isArray(learnerIds) ? learnerIds.length : '—'}</span>
      </div>
      <p className="panel-description table-description">Learners are shown in the exact order returned by the backend.</p>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Queue position</th><th>Learner ID</th><th>Waitlist status</th></tr></thead>
          <tbody>
            {Array.isArray(learnerIds) && learnerIds.map((learnerId, index) => (
              <tr key={`${learnerId}-${index}`}>
                <td><span className="queue-position">{String(index + 1).padStart(2, '0')}</span></td>
                <td><strong>{learnerId}</strong></td>
                <td><span className="waitlist-status"><Icon name="clock" size={14} /> Waiting</span></td>
              </tr>
            ))}
            {!loading && (!Array.isArray(learnerIds) || learnerIds.length === 0) && (
              <tr><td className="table-empty" colSpan="3">The waitlist is currently empty.</td></tr>
            )}
            {loading && (!Array.isArray(learnerIds) || learnerIds.length === 0) && (
              <tr><td className="table-empty" colSpan="3">Loading waitlist…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default WaitlistTable
