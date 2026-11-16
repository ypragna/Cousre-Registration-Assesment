import { useState } from 'react'
import Icon from './Icon.jsx'

function EligibilityForm({ onSubmit, disabled }) {
  const [learnerId, setLearnerId] = useState('')
  const [prerequisitesSatisfied, setPrerequisitesSatisfied] = useState(false)

  async function handleSubmit(event) {
    event.preventDefault()
    const submitted = await onSubmit({ learnerId: learnerId.trim(), prerequisitesSatisfied })
    if (submitted) setLearnerId('')
  }

  return (
    <section className="panel form-panel eligibility-panel" id="eligibility" aria-labelledby="eligibility-heading">
      <div className="panel-heading">
        <div className="panel-title-with-icon">
          <span className="section-icon icon-green"><Icon name="shield" size={19} /></span>
          <div><div className="eyebrow">LEARNER SETTINGS</div><h2 id="eligibility-heading">Eligibility management</h2></div>
        </div>
      </div>
      <p className="panel-description">Update a learner’s prerequisite status. The backend controls enrollment and promotion eligibility.</p>
      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="eligibility-learner-id">Learner ID</label>
        <input id="eligibility-learner-id" className="text-input" type="text" name="learnerId"
          autoComplete="off" placeholder="Enter registered learner ID" value={learnerId}
          onChange={(event) => setLearnerId(event.target.value)} required minLength={1} maxLength={64}
          pattern="[A-Za-z0-9_-]{1,64}" title="Use 1–64 letters, digits, underscores, or hyphens." />
        <label className="checkbox-row">
          <input type="checkbox" checked={prerequisitesSatisfied}
            onChange={(event) => setPrerequisitesSatisfied(event.target.checked)} />
          <span className="custom-checkbox" /><span>Prerequisites satisfied</span>
        </label>
        <button className="button button-secondary full-button" type="submit" disabled={disabled}>
          {disabled ? 'Updating…' : 'Update eligibility'}
          {!disabled && <Icon name="arrow" size={17} />}
        </button>
      </form>
    </section>
  )
}

export default EligibilityForm
