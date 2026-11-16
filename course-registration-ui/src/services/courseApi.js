const configuredBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'
const API_BASE_URL = import.meta.env.DEV ? '' : configuredBaseUrl.replace(/\/+$/, '')

export class ApiRequestError extends Error {
  constructor(message, { status, body } = {}) {
    super(message)
    this.name = 'ApiRequestError'
    this.status = status
    this.body = body
  }
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, options)
  } catch (error) {
    throw new ApiRequestError(
      'No response was received from the API. Check that the backend is running and the API URL is correct. If this is a production deployment, verify that the backend allows this site through CORS.',
      { body: error },
    )
  }

  const rawBody = await response.text()
  let body = null
  if (rawBody) {
    try {
      body = JSON.parse(rawBody)
    } catch {
      body = { message: rawBody }
    }
  }

  if (!response.ok) {
    const message = body?.message || `The backend returned HTTP ${response.status}.`
    const validationMessages = body?.validationErrors
      ? Object.values(body.validationErrors).join(' ')
      : ''
    throw new ApiRequestError(
      validationMessages ? `${message} ${validationMessages}` : message,
      { status: response.status, body },
    )
  }

  return body
}

function jsonOptions(data) {
  return {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  }
}

export function registerLearner(data) {
  return request('/api/learners', jsonOptions(data))
}

export function updateEligibility(learnerId, data) {
  return request(`/api/learners/${encodeURIComponent(learnerId)}/eligibility`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })
}

export function enrollLearner(learnerId) {
  return request(`/api/enrollments/${encodeURIComponent(learnerId)}`, {
    method: 'POST',
  })
}

export function dropLearner(learnerId) {
  return request(`/api/enrollments/${encodeURIComponent(learnerId)}`, {
    method: 'DELETE',
  })
}

export function getCourseState() {
  return request('/api/course', { method: 'GET' })
}
