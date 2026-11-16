import { useState } from 'react'
import Icon from './Icon.jsx'

function EnrollmentForm({ onSubmit, disabled }) {
  const [learnerId, setLearnerId] = useState('')

  async function handleSubmit(event) {
    event.preventDefault()
    const submitted = await onSubmit(learnerId.trim())
    if (submitted) setLearnerId('')
  }

  return (
    <section className="panel form-panel" id="enrollment" aria-labelledby="enrollment-heading">
      <div className="panel-heading">
        <div className="panel-title-with-icon">
          <span className="section-icon icon-violet"><Icon name="book" size={19} /></span>
          <div><div className="eyebrow">COURSE ACTION</div><h2 id="enrollment-heading">Course enrollment</h2></div>
        </div>
        <span className="step-badge">02</span>
      </div>
      <p className="panel-description">Enroll an eligible learner or add them to the FIFO waitlist.</p>
      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="enrollment-learner-id">Learner ID</label>
        <input id="enrollment-learner-id" className="text-input" type="text" name="learnerId"
          autoComplete="off" placeholder="Enter registered learner ID" value={learnerId}
          onChange={(event) => setLearnerId(event.target.value)} required minLength={1} maxLength={64}
          pattern="[A-Za-z0-9_-]{1,64}" title="Use 1–64 letters, digits, underscores, or hyphens." />
        <div className="form-spacer" />
        <button className="button button-primary full-button" type="submit" disabled={disabled}>
          {disabled ? 'Processing…' : 'Enroll learner'}
          {!disabled && <Icon name="arrow" size={17} />}
        </button>
      </form>
    </section>
  )
}

export default EnrollmentForm
