# Design

## Service boundary

`CourseRegistrationController` exposes the HTTP API and delegates state changes to `CourseRegistrationService`. The service owns the single `CourseOffering`, registered learners, enrollment set, and waitlist. Request/response DTOs are separate from the `CourseOffering` and `Learner` model records. `GlobalExceptionHandler` maps validation and domain errors to a consistent JSON error DTO.

## Data structures and invariants

- `CourseOffering` contains a course ID and a positive capacity; the default ID and capacity are `COURSE-101` and `3`.
- A map keyed by learner ID stores each learner's current prerequisite status.
- A `LinkedHashSet<String>` stores unique enrolled IDs.
- An `ArrayDeque`-backed `Queue<String>` stores waitlisted IDs in FIFO order.
- Every service operation, including state reads, is synchronized on the service instance.
- Enrollment count never exceeds capacity; an ID is not in both the enrolled set and waitlist.
- Only known learners with satisfied prerequisites may enroll or join the waitlist.

## API contracts

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/api/learners` | Register a unique learner with initial prerequisite status |
| `PUT` | `/api/learners/{learnerId}/eligibility` | Update prerequisite status |
| `POST` | `/api/enrollments/{learnerId}` | Enroll or append to the waitlist |
| `DELETE` | `/api/enrollments/{learnerId}` | Drop enrollment and attempt promotion |
| `GET` | `/api/course` | Return course, enrolled, and waitlisted state |

Learner identifiers are limited to 1-64 ASCII letters, digits, underscores, and hyphens. Request DTOs are Bean Validated. Domain errors and malformed request bodies use `ApiErrorResponse`; duplicate or ineligible enrollment attempts use operation statuses in `RegistrationResponse`.

## Prerequisite assumptions

The service does not calculate prerequisites from course history. A caller supplies each learner's initial `prerequisitesSatisfied` boolean and can update it through the eligibility endpoint. Registration is refused if eligibility is false. Changing eligibility does not automatically remove an enrolled learner.

## Waitlist promotion

Eligible learners may waitlist only when the course is full. When a seat becomes available, the service polls from the head of the queue, rechecks each learner's current prerequisite status, removes and skips ineligible learners, and promotes the first eligible learner. It continues until capacity is filled or no learner remains. Before admitting a new arrival, the service first processes any existing queue, preventing a newcomer from bypassing eligible waitlisted learners when seats are available.

## Concurrency

`synchronized` methods serialize state reads and mutations on the singleton service instance. This is appropriate for the in-memory, single-process scope: the enrollment check plus set/queue update is atomic relative to other requests. It does not coordinate multiple application instances.

## Limitations and tradeoffs

State is process-local and lost on restart. The application handles only one configured course, accepts caller-provided prerequisite status, and provides no authentication or authorization. The FIFO queue is in memory and unbounded. See [LIMITATIONS.md](LIMITATIONS.md).
