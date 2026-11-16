import { useCallback, useEffect, useRef, useState } from 'react'
import ConfirmDialog from '../components/ConfirmDialog.jsx'
import CourseOverview from '../components/CourseOverview.jsx'
import EligibilityForm from '../components/EligibilityForm.jsx'
import EnrolledLearnersTable from '../components/EnrolledLearnersTable.jsx'
import EnrollmentForm from '../components/EnrollmentForm.jsx'
import Header from '../components/Header.jsx'
import Notification from '../components/Notification.jsx'
import RegisterLearner from '../components/RegisterLearner.jsx'
import Sidebar from '../components/Sidebar.jsx'
import StatCard from '../components/StatCard.jsx'
import WaitlistTable from '../components/WaitlistTable.jsx'
import {
  dropLearner,
  enrollLearner,
  getCourseState,
  registerLearner,
  updateEligibility,
} from '../services/courseApi.js'

function messageOf(response, fallback) {
  return typeof response?.message === 'string' && response.message.trim()
    ? response.message
    : fallback
}

function Dashboard() {
  const [course, setCourse] = useState(null)
  const [loadingCourse, setLoadingCourse] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [connectionError, setConnectionError] = useState(false)
  const [busyAction, setBusyAction] = useState('')
  const [selectedLearner, setSelectedLearner] = useState('')
  const [notification, setNotification] = useState(null)
  const notificationTimer = useRef(null)
  const initialLoadStarted = useRef(false)

  const notify = useCallback((type, title, message) => {
    window.clearTimeout(notificationTimer.current)
    setNotification({ type, title, message })
    notificationTimer.current = window.setTimeout(() => setNotification(null), 6000)
  }, [])

  const refreshCourseState = useCallback(async ({ showLoading = true } = {}) => {
    if (showLoading) setRefreshing(true)
    try {
      const state = await getCourseState()
      setCourse(state)
      setConnectionError(false)
      return true
    } catch (error) {
      setConnectionError(true)
      notify('error', 'Backend unavailable', error.message)
      return false
    } finally {
      setLoadingCourse(false)
      if (showLoading) setRefreshing(false)
    }
  }, [notify])

  useEffect(() => {
    if (!initialLoadStarted.current) {
      initialLoadStarted.current = true
      refreshCourseState()
    }
    return () => window.clearTimeout(notificationTimer.current)
  }, [refreshCourseState])

  function showActionError(error, fallbackTitle) {
    const isConnectionError = error.status === undefined
    if (isConnectionError) setConnectionError(true)
    notify('error', isConnectionError ? 'Backend unavailable' : fallbackTitle, error.message)
  }

  async function handleRegister(data) {
    setBusyAction('register')
    try {
      const response = await registerLearner(data)
      setConnectionError(false)
      if (response?.status === 'LEARNER_REGISTERED') {
        notify('success', 'Learner registered', messageOf(response, 'Learner registered.'))
        await refreshCourseState({ showLoading: false })
        return true
      }
      if (response?.status === 'LEARNER_ALREADY_EXISTS') {
        notify('error', 'Duplicate learner', messageOf(response, 'Learner is already registered.'))
        return false
      }
      notify('error', 'Registration not completed', messageOf(response, 'The backend did not confirm learner registration.'))
      return false
    } catch (error) {
      if (error.status === 409 || error.body?.status === 'LEARNER_ALREADY_EXISTS') {
        notify('error', 'Duplicate learner', messageOf(error.body, error.message))
      } else {
        showActionError(error, 'Registration failed')
      }
      return false
    } finally {
      setBusyAction('')
    }
  }

  async function handleEnroll(learnerId) {
    setBusyAction('enroll')
    try {
      const response = await enrollLearner(learnerId)
      setConnectionError(false)
      const status = response?.status
      if (status === 'ENROLLED') {
        notify('success', 'Enrollment successful', messageOf(response, 'Learner enrolled successfully.'))
      } else if (status === 'WAITLISTED') {
        const position = Number.isInteger(response.waitlistPosition) ? ` Queue position: ${response.waitlistPosition}.` : ''
        notify('info', 'Added to waitlist', `${messageOf(response, 'Learner added to the FIFO waitlist.')}${position}`)
      } else if (status === 'ALREADY_ENROLLED') {
        notify('info', 'Already enrolled', messageOf(response, 'Learner is already enrolled.'))
      } else if (status === 'ALREADY_WAITLISTED') {
        notify('info', 'Already waitlisted', messageOf(response, 'Learner is already on the waitlist.'))
      } else if (status === 'PREREQUISITES_NOT_MET') {
        notify('error', 'Prerequisites not met', messageOf(response, 'Learner does not satisfy the course prerequisites.'))
      } else {
        notify('error', 'Enrollment not completed', messageOf(response, 'The backend did not confirm enrollment.'))
      }
      await refreshCourseState({ showLoading: false })
      return status === 'ENROLLED' || status === 'WAITLISTED'
    } catch (error) {
      showActionError(error, 'Enrollment failed')
      return false
    } finally {
      setBusyAction('')
    }
  }

  async function handleEligibilityUpdate({ learnerId, prerequisitesSatisfied }) {
    setBusyAction('eligibility')
    try {
      const response = await updateEligibility(learnerId, { prerequisitesSatisfied })
      setConnectionError(false)
      if (response?.status === 'ELIGIBILITY_UPDATED') {
        notify('success', 'Eligibility updated', messageOf(response, 'Learner prerequisite eligibility updated.'))
      } else {
        notify('error', 'Eligibility not updated', messageOf(response, 'The backend did not confirm the eligibility update.'))
      }
      await refreshCourseState({ showLoading: false })
      return response?.status === 'ELIGIBILITY_UPDATED'
    } catch (error) {
      showActionError(error, 'Eligibility update failed')
      return false
    } finally {
      setBusyAction('')
    }
  }

  async function confirmDrop() {
    const learnerId = selectedLearner
    if (!learnerId) return
    setBusyAction('drop')
    try {
      const response = await dropLearner(learnerId)
      setConnectionError(false)
      if (response?.status === 'DROPPED') {
        const promotedIds = Array.isArray(response.promotedLearnerIds) ? response.promotedLearnerIds : []
        const promotionMessage = promotedIds.length ? ` Promoted from the waitlist: ${promotedIds.join(', ')}.` : ''
        notify('success', 'Learner dropped', `${messageOf(response, 'Enrollment dropped.')}${promotionMessage}`)
      } else if (response?.status === 'NOT_ENROLLED') {
        notify('error', 'Learner was not enrolled', messageOf(response, 'Learner is not currently enrolled.'))
      } else {
        notify('error', 'Drop not completed', messageOf(response, 'The backend did not confirm this drop.'))
      }
      await refreshCourseState({ showLoading: false })
    } catch (error) {
      showActionError(error, 'Drop failed')
    } finally {
      setBusyAction('')
      setSelectedLearner('')
    }
  }

  const capacity = Number.isFinite(course?.capacity) ? course.capacity : null
  const enrolledCount = Number.isFinite(course?.enrolledCount) ? course.enrolledCount : null
  const availableSeats = capacity !== null && enrolledCount !== null ? Math.max(capacity - enrolledCount, 0) : null
  const waitlistedCount = Array.isArray(course?.waitlistedLearnerIds) ? course.waitlistedLearnerIds.length : null

  return (
    <div className="app-shell" id="dashboard">
      <Sidebar />
      <main className="main-content">
        <Header onRefresh={() => refreshCourseState()} refreshing={refreshing} connectionError={connectionError} />
        <div className="dashboard-content">
          <section className="welcome-row">
            <div>
              <div className="eyebrow welcome-eyebrow"><span className="welcome-spark">✦</span> COURSE OPERATIONS</div>
              <h2>Manage registrations with confidence.</h2>
              <p>Keep enrollment moving and your waitlist in the right order.</p>
            </div>
            <div className="welcome-date"><span className="welcome-date-dot" />Live course data</div>
          </section>
          <section className="stats-grid" aria-label="Course statistics">
            <StatCard label="Course capacity" value={capacity ?? '—'} detail="Total available seats" icon="book" />
            <StatCard label="Enrolled learners" value={enrolledCount ?? '—'} detail="Currently in the course" icon="users" variant="icon-blue" />
            <StatCard label="Available seats" value={availableSeats ?? '—'} detail="Open enrollment spots" icon="check" variant="icon-green" />
            <StatCard label="Waitlisted learners" value={waitlistedCount ?? '—'} detail="Waiting in FIFO order" icon="clock" variant="icon-amber" />
          </section>
          <CourseOverview course={course} loading={loadingCourse} />
          <div className="section-heading">
            <div><div className="eyebrow">REGISTRATION WORKFLOW</div><h2>Manage learners</h2></div>
            <span className="workflow-hint"><span className="hint-dot" />Updates sync with the backend</span>
          </div>
          <section className="forms-grid" aria-label="Learner management forms">
            <RegisterLearner onSubmit={handleRegister} disabled={Boolean(busyAction)} />
            <EnrollmentForm onSubmit={handleEnroll} disabled={Boolean(busyAction)} />
            <EligibilityForm onSubmit={handleEligibilityUpdate} disabled={Boolean(busyAction)} />
          </section>
          <section className="lists-grid" aria-label="Course learner lists">
            <EnrolledLearnersTable learnerIds={course?.enrolledLearnerIds} loading={loadingCourse || Boolean(busyAction)} onDrop={setSelectedLearner} />
            <WaitlistTable learnerIds={course?.waitlistedLearnerIds} loading={loadingCourse} />
          </section>
          <footer className="dashboard-footer">
            <span>CourseFlow <span className="footer-separator">·</span> Course registration management</span>
            <span>Waitlist order and promotions are controlled by the backend.</span>
          </footer>
        </div>
      </main>
      <ConfirmDialog learnerId={selectedLearner} busy={busyAction === 'drop'}
        onCancel={() => setSelectedLearner('')} onConfirm={confirmDrop} />
      <div className="notification-region" aria-live="polite" aria-atomic="true">
        <Notification notification={notification} onDismiss={() => setNotification(null)} />
      </div>
    </div>
  )
}

export default Dashboard
