# Course Registration

A minimal Spring Boot REST service for enrollment in one course offering, with prerequisite checks and a FIFO waitlist. State is held in memory; no database or authentication is used.

## Prerequisites and setup

- Java 21 or later
- The Maven wrapper included in this repository (no separate Maven installation required)

Clone/open the project, then run these commands from its root:

```powershell
.\mvnw.cmd clean test
.\mvnw.cmd spring-boot:run
```

The server listens on `http://localhost:8080`. The configured course defaults to ID `COURSE-101` and capacity `3`; update `course.id` and `course.capacity` in `src/main/resources/application.yaml` to change those values. Capacity must be positive.

## API

Learner IDs must contain 1-64 letters, digits, underscores, or hyphens. Register each learner and their current prerequisite eligibility before attempting enrollment. The eligibility update endpoint lets callers represent a prerequisite change; it is rechecked when a waitlisted learner is considered for promotion.

### Register a learner

`POST /api/learners`

```json
{
  "learnerId": "learner-1",
  "prerequisitesSatisfied": true
}
```

Successful response (`201 Created`):

```json
{
  "status": "LEARNER_REGISTERED",
  "message": "Learner registered.",
  "courseId": "COURSE-101",
  "learnerId": "learner-1",
  "enrolledCount": 0,
  "capacity": 3,
  "waitlistPosition": null,
  "promotedLearnerIds": []
}
```

Learner IDs are unique. Re-registering one returns `409 Conflict` with status `LEARNER_ALREADY_EXISTS`.

### Enroll or join the waitlist

`POST /api/enrollments/{learnerId}` (no request body)

```http
POST /api/enrollments/learner-1
```

An eligible learner is enrolled if there is capacity (`ENROLLED`); otherwise they join the end of the FIFO queue (`WAITLISTED`, with a 1-based `waitlistPosition`). A learner who does not meet prerequisites gets `PREREQUISITES_NOT_MET` and is not queued. Repeated requests return `ALREADY_ENROLLED` or `ALREADY_WAITLISTED` without duplicate state.

### Update prerequisite eligibility

`PUT /api/learners/{learnerId}/eligibility`

```json
{
  "prerequisitesSatisfied": false
}
```

Returns `ELIGIBILITY_UPDATED`. This does not automatically remove an enrolled learner. Eligibility is checked again when a queued learner is considered for promotion.

### Drop enrollment

`DELETE /api/enrollments/{learnerId}` (no request body)

Returns status `DROPPED` and includes any learner IDs promoted in `promotedLearnerIds`. The service removes newly ineligible waitlisted learners and continues in FIFO order until the available seat is filled or no eligible learner remains. Dropping a known learner who is not enrolled returns `NOT_ENROLLED` without changing state.

### View course state

`GET /api/course`

```json
{
  "courseId": "COURSE-101",
  "capacity": 3,
  "enrolledCount": 1,
  "enrolledLearnerIds": ["learner-1"],
  "waitlistedLearnerIds": ["learner-2"]
}
```

### Errors

Malformed JSON and invalid IDs return `400 Bad Request`; unknown learners return `404 Not Found`. Error responses use this shape:

```json
{
  "status": 400,
  "message": "Request validation failed.",
  "validationErrors": {
    "learnerId": "must contain 1-64 letters, digits, underscores, or hyphens"
  }
}
```

## Tests

Run all unit and Spring context tests with:

```powershell
.\mvnw.cmd test
```

Tests cover enrollment and waitlisting, duplicate requests, prerequisite changes, FIFO promotion and skip behavior, invalid/unknown learners, drops, fairness, invariants, and concurrent enrollment.
