import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  dropLearner,
  enrollLearner,
  getCourseState,
  registerLearner,
  updateEligibility,
} from './courseApi.js'

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('course API', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    vi.stubGlobal('fetch', vi.fn())
  })

  it('posts the registration payload through the same-origin development proxy', async () => {
    fetch.mockResolvedValue(jsonResponse({ status: 'LEARNER_REGISTERED' }, 201))

    await registerLearner({ learnerId: 'L101', prerequisitesSatisfied: true })

    expect(fetch).toHaveBeenCalledWith('/api/learners', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ learnerId: 'L101', prerequisitesSatisfied: true }),
    })
  })

  it('encodes learner IDs and sends the eligibility boolean in a PUT body', async () => {
    fetch.mockResolvedValue(jsonResponse({ status: 'ELIGIBILITY_UPDATED' }))

    await updateEligibility('A/B', { prerequisitesSatisfied: false })

    expect(fetch).toHaveBeenCalledWith('/api/learners/A%2FB/eligibility', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prerequisitesSatisfied: false }),
    })
  })

  it('posts enrollment without a request body', async () => {
    fetch.mockResolvedValue(jsonResponse({ status: 'ENROLLED' }))

    await enrollLearner('L101')

    expect(fetch).toHaveBeenCalledWith('/api/enrollments/L101', { method: 'POST' })
  })

  it('deletes enrollment without a request body', async () => {
    fetch.mockResolvedValue(jsonResponse({ status: 'DROPPED' }))

    await dropLearner('L101')

    expect(fetch).toHaveBeenCalledWith('/api/enrollments/L101', { method: 'DELETE' })
  })

  it('reads the course endpoint and preserves the backend payload', async () => {
    const state = {
      courseId: 'COURSE-101',
      capacity: 3,
      enrolledCount: 2,
      enrolledLearnerIds: ['L101', 'L102'],
      waitlistedLearnerIds: ['L103'],
    }
    fetch.mockResolvedValue(jsonResponse(state))

    await expect(getCourseState()).resolves.toEqual(state)
    expect(fetch).toHaveBeenCalledWith('/api/course', { method: 'GET' })
  })

  it('surfaces a non-2xx backend message and status', async () => {
    fetch.mockResolvedValue(jsonResponse({ status: 409, message: 'Learner is already registered.' }, 409))

    await expect(registerLearner({ learnerId: 'L101', prerequisitesSatisfied: false }))
      .rejects.toMatchObject({
        status: 409,
        message: 'Learner is already registered.',
        body: { status: 409, message: 'Learner is already registered.' },
      })
  })
})
