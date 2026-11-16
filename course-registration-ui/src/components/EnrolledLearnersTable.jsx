import Icon from './Icon.jsx'

function EnrolledLearnersTable({ learnerIds, loading, onDrop }) {
  return (
    <section className="panel table-panel" aria-labelledby="enrolled-heading">
      <div className="panel-heading table-heading">
        <div><div className="eyebrow">COURSE ROSTER</div><h2 id="enrolled-heading">Enrolled learners</h2></div>
        <span className="count-badge">{Array.isArray(learnerIds) ? learnerIds.length : '—'}</span>
      </div>
      <div className="table-scroll">
        <table>
          <thead><tr><th>Learner ID</th><th>Enrollment status</th><th className="action-column">Action</th></tr></thead>
          <tbody>
            {Array.isArray(learnerIds) && learnerIds.map((learnerId) => (
              <tr key={learnerId}>
                <td><span className="learner-avatar">{learnerId.slice(0, 1).toUpperCase()}</span><strong>{learnerId}</strong></td>
                <td><span className="table-status"><span className="table-status-dot" />Enrolled</span></td>
                <td className="action-column">
                  <button className="drop-button" type="button" onClick={() => onDrop(learnerId)} disabled={loading}>
                    <Icon name="trash" size={15} /> Drop
                  </button>
                </td>
              </tr>
            ))}
            {!loading && (!Array.isArray(learnerIds) || learnerIds.length === 0) && (
              <tr><td className="table-empty" colSpan="3">No learners are currently enrolled.</td></tr>
            )}
            {loading && (!Array.isArray(learnerIds) || learnerIds.length === 0) && (
              <tr><td className="table-empty" colSpan="3">Loading enrolled learners…</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default EnrolledLearnersTable
