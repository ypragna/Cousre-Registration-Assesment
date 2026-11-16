import { useState } from 'react'
import Icon from './Icon.jsx'

function RegisterLearner({ onSubmit, disabled }) {
  const [learnerId, setLearnerId] = useState('')
  const [prerequisitesSatisfied, setPrerequisitesSatisfied] = useState(true)

  async function handleSubmit(event) {
    event.preventDefault()
    const submitted = await onSubmit({ learnerId: learnerId.trim(), prerequisitesSatisfied })
    if (submitted) setLearnerId('')
  }

  return (
    <section className="panel form-panel" id="register" aria-labelledby="register-heading">
      <div className="panel-heading">
        <div className="panel-title-with-icon">
          <span className="section-icon icon-blue"><Icon name="userPlus" size={19} /></span>
          <div><div className="eyebrow">GET STARTED</div><h2 id="register-heading">Register learner</h2></div>
        </div>
        <span className="step-badge">01</span>
      </div>
      <p className="panel-description">Add a learner to the course registration system.</p>
      <form onSubmit={handleSubmit}>
        <label className="field-label" htmlFor="register-learner-id">Learner ID</label>
        <input id="register-learner-id" className="text-input" type="text" name="learnerId"
          autoComplete="off" placeholder="e.g. L101" value={learnerId}
          onChange={(event) => setLearnerId(event.target.value)} required minLength={1} maxLength={64}
          pattern="[A-Za-z0-9_-]{1,64}" title="Use 1–64 letters, digits, underscores, or hyphens." />
        <label className="checkbox-row">
          <input type="checkbox" checked={prerequisitesSatisfied}
            onChange={(event) => setPrerequisitesSatisfied(event.target.checked)} />
          <span className="custom-checkbox" /><span>Prerequisites satisfied</span>
        </label>
        <button className="button button-primary full-button" type="submit" disabled={disabled}>
          {disabled ? 'Registering…' : 'Register learner'}
          {!disabled && <Icon name="arrow" size={17} />}
        </button>
      </form>
    </section>
  )
}

export default RegisterLearner
