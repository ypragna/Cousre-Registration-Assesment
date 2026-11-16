import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import Dashboard from './Dashboard.jsx'
import {
  dropLearner,
  enrollLearner,
  getCourseState,
  registerLearner,
  updateEligibility,
} from '../services/courseApi.js'

vi.mock('../services/courseApi.js', () => ({
  dropLearner: vi.fn(),
  enrollLearner: vi.fn(),
  getCourseState: vi.fn(),
  registerLearner: vi.fn(),
  updateEligibility: vi.fn(),
}))

const initialCourse = {
  courseId: 'COURSE-201',
  capacity: 3,
  enrolledCount: 2,
  enrolledLearnerIds: ['L101', 'L102'],
  waitlistedLearnerIds: ['L103', 'L104'],
}

function renderDashboard() {
  return render(<Dashboard />)
}

describe('CourseFlow dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    getCourseState.mockResolvedValue(initialCourse)
  })

  it('renders statistics and course data from the backend', async () => {
    renderDashboard()

    expect(await screen.findByText('COURSE-201')).toBeInTheDocument()
    expect(screen.getAllByText('Available seats')).toHaveLength(2)
    expect(screen.getAllByText('Enrolled learners')).toHaveLength(2)
    expect(screen.getByText('Waitlisted learners')).toBeInTheDocument()
    expect(screen.getByText('Total capacity')).toBeInTheDocument()
  })

  it('registers a learner with the entered ID and prerequisite boolean', async () => {
    const user = userEvent.setup()
    registerLearner.mockResolvedValue({ status: 'LEARNER_REGISTERED', message: 'Created.' })
    const { container } = renderDashboard()
    const registerPanel = container.querySelector('#register')

    await user.type(within(registerPanel).getByLabelText('Learner ID'), 'L205')
    await user.click(within(registerPanel).getByRole('button', { name: 'Register learner' }))

    await waitFor(() => expect(registerLearner).toHaveBeenCalledWith({
      learnerId: 'L205',
      prerequisitesSatisfied: true,
    }))
    expect(await screen.findByText('Created.')).toBeInTheDocument()
  })

  it('shows the backend duplicate-registration response', async () => {
    const user = userEvent.setup()
    const error = new Error('Learner is already registered.')
    error.status = 409
    error.body = { status: 'LEARNER_ALREADY_EXISTS', message: 'Learner is already registered.' }
    registerLearner.mockRejectedValue(error)
    const { container } = renderDashboard()
    const registerPanel = container.querySelector('#register')

    await user.type(within(registerPanel).getByLabelText('Learner ID'), 'L101')
    await user.click(within(registerPanel).getByRole('button', { name: 'Register learner' }))

    expect(await screen.findByText('Duplicate learner')).toBeInTheDocument()
    expect(screen.getByText('Learner is already registered.')).toBeInTheDocument()
  })

  it('preserves the backend waitlist order', async () => {
    const { container } = renderDashboard()

    await screen.findByText('L104')
    const waitlist = container.querySelector('#waitlist')
    const rows = within(waitlist).getAllByRole('row')
    expect(within(rows[1]).getByText('L103')).toBeInTheDocument()
    expect(within(rows[2]).getByText('L104')).toBeInTheDocument()
    expect(within(rows[1]).getByText('01')).toBeInTheDocument()
    expect(within(rows[2]).getByText('02')).toBeInTheDocument()
  })

  it('requires drop confirmation and refreshes the course state after dropping', async () => {
    const user = userEvent.setup()
    const updatedCourse = {
      ...initialCourse,
      enrolledCount: 2,
      enrolledLearnerIds: ['L102', 'L103'],
      waitlistedLearnerIds: ['L104'],
    }
    getCourseState.mockResolvedValueOnce(initialCourse).mockResolvedValueOnce(updatedCourse)
    dropLearner.mockResolvedValue({
      status: 'DROPPED',
      message: 'Enrollment dropped; eligible waitlisted learner(s) promoted.',
      promotedLearnerIds: ['L103'],
    })
    const { container } = renderDashboard()
    const enrolledPanel = container.querySelector('.lists-grid .table-panel')

    await within(enrolledPanel).findByText('L101')
    await user.click(within(enrolledPanel).getAllByRole('button', { name: /Drop/ })[0])
    expect(screen.getByRole('dialog')).toHaveTextContent('L101')
    expect(dropLearner).not.toHaveBeenCalled()

    await user.click(screen.getByRole('button', { name: 'Confirm drop' }))
    await waitFor(() => expect(dropLearner).toHaveBeenCalledWith('L101'))
    await waitFor(() => expect(getCourseState).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('L103')).toBeInTheDocument()
    expect(screen.getByText('L104')).toBeInTheDocument()
  })

  it('sends the selected eligibility boolean and refreshes state', async () => {
    const user = userEvent.setup()
    updateEligibility.mockResolvedValue({ status: 'ELIGIBILITY_UPDATED', message: 'Updated.' })
    const { container } = renderDashboard()

    const section = container.querySelector('#eligibility')
    await user.type(within(section).getByLabelText('Learner ID'), 'L101')
    await user.click(within(section).getByRole('checkbox'))
    await user.click(within(section).getByRole('button', { name: 'Update eligibility' }))

    await waitFor(() => expect(updateEligibility).toHaveBeenCalledWith('L101', { prerequisitesSatisfied: true }))
    await waitFor(() => expect(getCourseState).toHaveBeenCalledTimes(2))
    expect(await screen.findByText('Updated.')).toBeInTheDocument()
  })

  it('shows meaningful backend errors and disables repeated submissions while pending', async () => {
    const user = userEvent.setup()
    let finishRequest
    enrollLearner.mockReturnValue(new Promise((resolve) => { finishRequest = resolve }))
    const { container } = renderDashboard()
    const enrollmentPanel = container.querySelector('#enrollment')

    await user.type(within(enrollmentPanel).getByLabelText('Learner ID'), 'L101')
    const enrollButton = within(enrollmentPanel).getByRole('button', { name: 'Enroll learner' })
    await user.click(enrollButton)
    expect(enrollButton).toBeDisabled()
    expect(enrollLearner).toHaveBeenCalledTimes(1)

    finishRequest({ status: 'PREREQUISITES_NOT_MET', message: 'Prerequisites must be completed.' })
    expect(await screen.findByText('Prerequisites must be completed.')).toBeInTheDocument()
  })

  it('reports an unknown learner using the backend error message', async () => {
    const user = userEvent.setup()
    const error = new Error('Learner L999 was not found.')
    error.status = 404
    enrollLearner.mockRejectedValue(error)
    const { container } = renderDashboard()
    const enrollmentPanel = container.querySelector('#enrollment')

    await user.type(within(enrollmentPanel).getByLabelText('Learner ID'), 'L999')
    await user.click(within(enrollmentPanel).getByRole('button', { name: 'Enroll learner' }))

    expect(await screen.findByText('Learner L999 was not found.')).toBeInTheDocument()
  })

  it('handles the backend repeated-drop status as an error', async () => {
    const user = userEvent.setup()
    dropLearner.mockResolvedValue({ status: 'NOT_ENROLLED', message: 'Learner is not currently enrolled.' })
    const { container } = renderDashboard()
    const enrolledPanel = container.querySelector('.lists-grid .table-panel')

    await within(enrolledPanel).findByText('L101')
    await user.click(within(enrolledPanel).getAllByRole('button', { name: /Drop/ })[0])
    await user.click(screen.getByRole('button', { name: 'Confirm drop' }))

    expect(await screen.findByText('Learner was not enrolled')).toBeInTheDocument()
    expect(screen.getByText('Learner is not currently enrolled.')).toBeInTheDocument()
  })
})
