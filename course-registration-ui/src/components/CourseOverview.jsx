import Icon from './Icon.jsx'

function CourseOverview({ course, loading }) {
  const capacity = Number.isFinite(course?.capacity) ? course.capacity : null
  const enrolled = Number.isFinite(course?.enrolledCount) ? course.enrolledCount : null
  const seats = capacity !== null && enrolled !== null ? Math.max(capacity - enrolled, 0) : null
  const waitlisted = Array.isArray(course?.waitlistedLearnerIds) ? course.waitlistedLearnerIds.length : null
  const progress = capacity > 0 && enrolled !== null ? Math.min((enrolled / capacity) * 100, 100) : 0

  return (
    <section className="panel overview-panel" aria-labelledby="overview-heading">
      <div className="panel-heading overview-heading">
        <div>
          <div className="eyebrow">COURSE OVERVIEW</div>
          <h2 id="overview-heading">{course?.courseId || 'Course details'}</h2>
        </div>
        {seats !== null && (
          <span className={`status-pill ${seats === 0 ? 'status-full' : 'status-available'}`}>
            <span className="status-dot" />{seats === 0 ? 'FULL' : 'AVAILABLE'}
          </span>
        )}
      </div>
      {loading && !course ? (
        <div className="loading-block" role="status">Loading course details…</div>
      ) : !course ? (
        <div className="empty-inline">Course details will appear when the backend is available.</div>
      ) : (
        <>
          <div className="overview-metrics">
            <div className="overview-metric"><span>Total capacity</span><strong>{capacity ?? '—'}</strong></div>
            <div className="overview-metric"><span>Enrolled</span><strong>{enrolled ?? '—'}</strong></div>
            <div className="overview-metric"><span>Available seats</span><strong>{seats ?? '—'}</strong></div>
            <div className="overview-metric"><span>Waitlist queue</span><strong>{waitlisted ?? '—'}</strong></div>
          </div>
          <div className="capacity-section">
            <div className="capacity-label">
              <span>Course capacity</span>
              <span>{capacity !== null && enrolled !== null ? `${enrolled} of ${capacity} seats` : 'Not reported'}</span>
            </div>
            <div className="progress-track" role="progressbar" aria-label="Course capacity used"
              aria-valuenow={capacity > 0 && enrolled !== null ? Math.min(enrolled, capacity) : 0}
              aria-valuemin="0" aria-valuemax={capacity ?? 0}>
              <div className="progress-fill" style={{ width: `${progress}%` }} />
            </div>
          </div>
          <div className="overview-footnote">
            <Icon name="users" size={15} />
            <span>Waitlist order reflects the FIFO queue provided by the backend.</span>
          </div>
        </>
      )}
    </section>
  )
}

export default CourseOverview
