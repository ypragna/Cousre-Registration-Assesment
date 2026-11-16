# CourseFlow

CourseFlow is a responsive React dashboard for the existing Spring Boot course-registration service. It displays the live course state and provides learner registration, enrollment, drop, FIFO waitlist, and prerequisite eligibility actions. The backend remains the source of truth for eligibility, enrollment, and waitlist promotions.

## Technology stack

- React 19
- Vite
- JavaScript modules and the Fetch API
- Responsive CSS with inline SVG icons
- Vitest and React Testing Library for frontend tests

## Folder structure

```text
src/
  components/       Reusable dashboard, forms, tables, dialogs, and notifications
  pages/            Dashboard state and workflow orchestration
  services/         Backend API requests and HTTP error handling
  App.jsx
  App.css
  index.css
  main.jsx
.env.example
```

## Installation

Use Node.js supported by the installed Vite version (Node.js 20.19+ or 22.12+).

```sh
npm install
```

## Environment and backend connection

Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` to the Spring Boot server's origin. The default example is:

```dotenv
VITE_API_BASE_URL=http://localhost:8080
```

Restart Vite after changing environment variables. In development, the browser sends same-origin `/api` requests to Vite, which proxies them to `VITE_API_BASE_URL`; this avoids browser CORS restrictions while keeping the backend unchanged. In a production deployment, the frontend calls `VITE_API_BASE_URL` directly, so the backend must allow the deployed frontend origin through CORS. CourseFlow does not mock or simulate backend results.

## API endpoints

| Method | URL | Purpose |
| --- | --- | --- |
| `POST` | `/api/learners` | Register a learner |
| `PUT` | `/api/learners/{learnerId}/eligibility` | Update prerequisite eligibility |
| `POST` | `/api/enrollments/{learnerId}` | Enroll or enqueue a learner (no request body) |
| `DELETE` | `/api/enrollments/{learnerId}` | Drop an enrolled learner (no request body) |
| `GET` | `/api/course` | Read current course state |

Learner IDs are URL-encoded for path requests. Request/response handling follows the backend's `CreateLearnerRequest`, `EligibilityRequest`, `RegistrationResponse`, `CourseStateResponse`, and `ApiErrorResponse` DTOs. Error responses include the backend message and, when present, validation messages.

## Features

- Course capacity, enrolled count, available seats, and waitlist totals from live course data.
- Course overview and backend-provided enrolled learner and FIFO waitlist order.
- Learner registration with prerequisite selection. Registration does not automatically enroll the learner.
- Enrollment with handling for the backend's `ENROLLED`, `WAITLISTED`, `ALREADY_ENROLLED`, `ALREADY_WAITLISTED`, and `PREREQUISITES_NOT_MET` statuses.
- Confirmation before a drop; the dashboard then refreshes backend state to reflect any FIFO promotion.
- Eligibility updates without implementing prerequisite or promotion rules in the client.
- Refresh action, loading states, backend connection indicator, and success/error notifications.

## Run the application

Start the backend separately, then run:

```sh
npm run dev
```

Vite prints the local frontend URL when ready.

## Build

```sh
npm run build
```

## Tests

Run the frontend tests with:

```sh
npm test
```

Run lint checks with:

```sh
npm run lint
```

## Troubleshooting

- **Backend unavailable:** Confirm Spring Boot is running and `VITE_API_BASE_URL` has the correct origin, then refresh the course state.
- **CORS error:** Configure the backend or development environment to permit the Vite origin. This frontend does not modify backend CORS policy.
- **Validation error:** Learner IDs must contain 1–64 letters, digits, underscores, or hyphens. The backend response is shown when available.
- **Build or test environment error:** Use a Node.js version supported by Vite and reinstall dependencies with `npm install`.

## Known limitations

- The backend exposes no learner directory, learner profile details, or registration timestamps; only the IDs in the current course state can be listed.
- There are no manual waitlist promotion controls. Eligibility, FIFO ordering, and promotion decisions remain backend-owned.
- The course state response has no explicit per-row status or course offering display name; learner status labels shown here reflect the corresponding backend ID list.
- A backend integration was not assumed from frontend build/test results; run the Spring Boot service and configure CORS to verify end-to-end behavior.
