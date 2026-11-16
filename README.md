# Course Registration & FIFO Waitlist Management

A monorepo containing a Java Spring Boot API and an optional React/Vite UI for managing enrollment in a **single course offering**.

> **Assessment scope:** The assessment asks for a bounded backend enrollment/drop/waitlist feature and does not require a frontend. The React UI is an optional demonstration. Verify the actual service behavior and DTO fields before describing the implementation as complete.

## Repository layout

```text
course-registration-assessment/
├── course-registration/       # Spring Boot backend
├── course-registration-ui/    # React/Vite frontend
├── .gitignore
└── README.md
```

## What the system does

1. Register a learner with a prerequisite eligibility flag.
2. Enroll a registered learner if eligible and a seat is available.
3. Place eligible learners on a FIFO waitlist when the course is full.
4. Drop an enrolled learner, allowing the backend to promote an eligible waitlisted learner.
5. Update prerequisite eligibility and view current course state.

Actual duplicate, error, and promotion results are determined by the backend service; consult its implementation and tests.

## Backend API (from CourseRegistrationController)

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/learners` | Register learner |
| PUT | `/api/learners/{learnerId}/eligibility` | Update prerequisite eligibility |
| POST | `/api/enrollments/{learnerId}` | Enroll or waitlist learner |
| DELETE | `/api/enrollments/{learnerId}` | Drop learner |
| GET | `/api/course` | Retrieve course state |

Register learner request:

```json
{"learnerId":"L101","prerequisitesSatisfied":true}
```

Update eligibility request:

```json
{"prerequisitesSatisfied":false}
```

The controller uses `RegistrationResponse` for writes and `CourseStateResponse` for reads. Check those DTOs for the exact JSON response shape.

## Prerequisites

- JDK compatible with the backend `pom.xml` (Java 21 if configured)
- Maven or the Maven wrapper
- Node.js and npm compatible with the UI `package.json`

## Start backend

```bash
cd course-registration
./mvnw spring-boot:run
```

On Windows PowerShell, use `./mvnw.cmd spring-boot:run` (or `.\mvnw.cmd spring-boot:run`). The typical default port is 8080; check backend configuration.

## Start frontend

In a second terminal:

```bash
cd course-registration-ui
npm install
npm run dev
```

Vite typically serves on `http://localhost:5173`. Configure the UI's API base URL to match the backend; see the UI README.

## Tests and builds

```bash
cd course-registration
./mvnw test
```

```bash
cd course-registration-ui
npm run build
```

Run `npm test` only if `package.json` defines a test script.

## Assessment evidence

Keep the backend's focused automated tests, design specification, AI prompt/use record, and limitations together with the submission. Record actual prompts, accepted/edited/rejected suggestions, and independently observed test results; do not invent verification evidence.

## Known limitations / verify before submission

- Scope is one course offering, not a course catalog.
- If the service uses in-memory collections, data is lost on restart.
- Concurrency behavior, prerequisite skip/retain policy, and API response statuses must be confirmed against the implementation.
- UI is optional and outside the PDF's required assessment scope.
