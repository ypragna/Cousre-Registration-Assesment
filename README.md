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

Test Evidence- https://drive.google.com/file/d/1h-5t4fHjDRN-UJ9R1_q6JrhQHJxuJaL0/view?usp=sharing

AI Prompts
UI
```text
Act as a senior React developer and UI/UX engineer. Build a complete, professional React frontend for my existing Course Registration and FIFO Waitlist Management backend.

PROJECT STRUCTURE:
course-registration-assessment/
  backend/
  frontend/

The backend is Spring Boot and the frontend is React with Vite.

IMPORTANT: The backend controller already exists. Do not create fictional API endpoints, do not change backend business logic, and do not assume fields that are not defined in the DTOs.

FIRST INSPECT:
- ../backend/src/main/java/com/course/registration/controller/CourseRegistrationController.java
- CourseStateResponse.java
- RegistrationResponse.java
- CreateLearnerRequest.java
- EligibilityRequest.java
- The backend's global exception handler, if present
- frontend/package.json
- Existing frontend components and configuration

ACTUAL BACKEND ENDPOINTS:

1. POST /api/learners
Request body:
{
  "learnerId": "L101",
  "prerequisitesSatisfied": true
}
Registers a learner. Successful registration returns HTTP 201. A duplicate learner returns HTTP 409 with a RegistrationResponse body.

2. PUT /api/learners/{learnerId}/eligibility
Request body:
{
  "prerequisitesSatisfied": false
}
Updates the learner's prerequisite eligibility.

3. POST /api/enrollments/{learnerId}
No request body.
Enrolls an eligible learner or adds them to the FIFO waitlist when the course is full.

4. DELETE /api/enrollments/{learnerId}
No request body.
Drops an enrolled learner. The backend handles FIFO waitlist promotion.

5. GET /api/course
Retrieves the current course state.

Use these exact endpoints and HTTP methods. Inspect the DTOs to identify actual response fields and statuses. Do not invent a learner listing endpoint or manual promotion endpoint.

UI DESIGN:
Build a modern, enterprise-grade dashboard named CourseFlow.

Visual style:
- Clean professional light theme
- Navy blue and white
- Soft gray page background
- Rounded cards with subtle shadows
- Modern typography
- Consistent spacing
- Responsive layout
- Accessible forms, buttons, labels and dialogs
- Lucide React icons if available
- Professional loading, success and error states

LAYOUT:

LEFT SIDEBAR:
- CourseFlow logo and name
- Dashboard
- Register Learner
- Course Enrollment
- Waitlist
- Eligibility Management

TOP HEADER:
- Course Registration Dashboard
- Refresh Course State button
- Backend connection error indicator if a request fails

DASHBOARD STATISTICS:
Create four statistics cards:
1. Course Capacity
2. Enrolled Learners
3. Available Seats
4. Waitlisted Learners

Use actual data from GET /api/course. Calculate available seats from capacity minus enrolled count only if those values exist in the response. Do not invent backend data.

COURSE OVERVIEW:
Display:
- Course offering identifier if provided
- Total capacity
- Enrolled count
- Available seats
- Capacity progress bar
- FULL or AVAILABLE status
- Current waitlist count

FEATURE 1: REGISTER LEARNER

Create a form containing:
- Learner ID text field
- Prerequisites Satisfied toggle or checkbox
- Register Learner button

On submit:
POST /api/learners

Request body:
{
  "learnerId": enteredLearnerId,
  "prerequisitesSatisfied": selectedBoolean
}

Validate learner ID.
Disable the submit button while processing.
Handle HTTP 201 success.
Handle HTTP 409 duplicate learner.
Show the actual backend response message when available.
Do not automatically enroll unless the user explicitly chooses an enrollment action.

FEATURE 2: COURSE ENROLLMENT

Create an enrollment form:
- Learner ID input
- Enroll Learner button

On submit:
POST /api/enrollments/{learnerId}

No request body.

Handle the backend response status and message:
- Successful enrollment
- Added to waitlist
- Already enrolled
- Already waitlisted
- Prerequisite failure
- Unknown learner
- Other backend results

Use the exact status values from RegistrationResponse and the service implementation. Do not assume status names.

Refresh GET /api/course after enrollment.

FEATURE 3: ENROLLED LEARNERS

Display the enrolled learners returned by GET /api/course.

Use a table with:
- Learner ID
- Enrollment status
- Drop action

Do not assume learner name, email or enrollment timestamp fields exist.

Each Drop button must:
1. Open a confirmation dialog.
2. Show the selected learner ID.
3. On confirmation, call DELETE /api/enrollments/{learnerId}.
4. Display the backend response.
5. Refresh the course state.
6. Show the updated enrolled learners and waitlist.

Do not implement waitlist promotion in React. The backend is responsible for promotion.

FEATURE 4: FIFO WAITLIST

Display the waitlist in its actual backend-provided order.

Table columns:
- Queue position
- Learner ID
- Waitlist status

Display the first learner as position 1.

Do not sort the waitlist alphabetically.
Do not create a manual Promote button.
Do not reorder the waitlist.
Do not allow learners to bypass the backend queue.

After an enrolled learner drops, refresh GET /api/course to show the updated waitlist and promoted learner.

FEATURE 5: ELIGIBILITY MANAGEMENT

Create a form containing:
- Learner ID
- Prerequisites Satisfied checkbox/toggle
- Update Eligibility button

Call:
PUT /api/learners/{learnerId}/eligibility

Request:
{
  "prerequisitesSatisfied": selectedBoolean
}

Display the backend result.
Refresh course state afterward.

Explain that the backend controls enrollment and promotion eligibility. Do not implement eligibility rules in React.

FEATURE 6: NOTIFICATIONS

Implement success and error notifications for:
- Learner registered
- Duplicate learner
- Successful enrollment
- Added to waitlist
- Prerequisite failure
- Successful drop
- Invalid or repeated drop
- Eligibility updated
- Backend unavailable

Read actual response messages where available.
Handle non-2xx responses including HTTP 409.
Do not treat every HTTP 200 as business success; inspect RegistrationResponse.status.

FEATURE 7: API INTEGRATION

Create:
src/services/courseApi.js

Implement:
registerLearner(data)
updateEligibility(learnerId, data)
enrollLearner(learnerId)
dropLearner(learnerId)
getCourseState()

Use Axios or Fetch API.
Use a configurable VITE_API_BASE_URL.
Create .env.example with:
VITE_API_BASE_URL=http://localhost:8080

Ensure the final URLs are:
http://localhost:8080/api/learners
http://localhost:8080/api/learners/{learnerId}/eligibility
http://localhost:8080/api/enrollments/{learnerId}
http://localhost:8080/api/enrollments/{learnerId}
http://localhost:8080/api/course

Use encodeURIComponent for learner IDs in URL paths.
Handle network failures gracefully.
Do not hardcode fake successful responses.

FEATURE 8: REACT COMPONENTS

Suggested structure:

src/
  components/
    Sidebar.jsx
    Header.jsx
    StatCard.jsx
    CourseOverview.jsx
    RegisterLearner.jsx
    EnrollmentForm.jsx
    EnrolledLearnersTable.jsx
    WaitlistTable.jsx
    EligibilityForm.jsx
    ConfirmDialog.jsx
    Notification.jsx
  services/
    courseApi.js
  pages/
    Dashboard.jsx
  App.jsx
  main.jsx
  index.css

Keep components reusable and avoid unnecessary complexity.

FEATURE 9: STATE MANAGEMENT

Use React hooks:
- useState
- useEffect
- useCallback where appropriate

Use a shared course-state refresh function.
Load course state when the dashboard mounts.
Refresh after successful write operations.
Avoid duplicate API requests.
Avoid stale UI data.
Disable duplicate submissions.
Provide loading and empty states.

FEATURE 10: TESTING

Use Vitest and React Testing Library if appropriate.

Test:
1. Dashboard renders API data.
2. Learner registration sends the correct request.
3. Duplicate registration displays an error.
4. Enrollment calls the correct endpoint without a body.
5. Waitlist order is preserved.
6. Drop confirmation works.
7. Dropping refreshes the course state.
8. Eligibility update sends the correct boolean.
9. Backend errors display meaningful messages.
10. Loading states disable repeated submissions.

FEATURE 11: README

Create frontend/README.md with:
- Application overview
- Technology stack
- Folder structure
- Installation instructions
- Environment variables
- Backend connection setup
- API endpoint table
- Feature descriptions
- npm run dev
- npm run build
- Test execution instructions
- Troubleshooting
- Known limitations

FINAL VERIFICATION:
1. Run npm install if necessary.
2. Run npm run build.
3. Run available frontend tests.
4. Fix compilation and lint errors.
5. Verify the frontend matches the actual DTO contracts.
6. Report any missing backend response fields.
7. Do not claim successful backend integration unless it has actually been tested.

IMPORTANT:
Do not implement new backend endpoints.
Do not introduce unnecessary authentication, payments, course catalogs or databases.
Do not generate a mock-only dashboard.
Build a working frontend connected to the existing Spring Boot backend.

First inspect the code and DTOs, then implement the UI.
```


Backend Prompt
```text
Act as a senior Java Spring Boot engineer. Implement the Course Registration AI-Assisted Engineering Assessment in my existing Spring Boot starter project.
IMPORTANT:
First inspect the current project structure, pom.xml, Java version, existing classes, interfaces, tests and conventions. Reuse the existing project setup. Do not replace existing configurations unnecessarily. If no application code exists, create a minimal implementation using Spring Boot, Java 21, Maven and in-memory storage.
OBJECTIVE:
Implement enrollment, dropping and FIFO waitlist promotion for ONE course offering only. Do not create a complete registration platform.
FUNCTIONAL REQUIREMENTS:
1.
Course has an ID and positive maximum capacity.
2.
Learner has a unique ID and prerequisite eligibility.
3.
Enroll a learner only when prerequisites are satisfied and capacity is available.
4.
When the course is full, place an eligible learner on a FIFO waitlist.
5.
Prevent duplicate enrollment and duplicate waitlist entries.
6.
Prevent a learner from being enrolled and waitlisted simultaneously.
7.
Drop an enrolled learner and automatically promote the earliest eligible waitlisted learner.
8.
Document this eligibility policy: learners must satisfy prerequisites to join the waitlist; eligibility is rechecked during promotion. If a learner becomes ineligible, remove and skip them, continuing to the next eligible learner.
9.
Invalid requests, unknown learners, and repeated drops must return clear results without corrupting state.
10.
Never allow enrolled count to exceed course capacity.
11.
Ensure that newly arriving learners cannot bypass an existing eligible waitlist when seats are available.
12.
Protect state-changing operations against concurrent requests using an appropriate locking approach for the in-memory implementation.
IMPLEMENTATION:
•
Follow controller/service/model/DTO/exception separation where appropriate.
•
Keep the implementation minimal and readable.
•
Use in-memory collections, not a database.
•
Use a Set for unique enrolled learner IDs and a FIFO queue for waitlisted learners.
•
Provide REST endpoints for enrollment, dropping and retrieving the current course state.
•
Add an eligibility mechanism suitable for testing prerequisite changes. Do not introduce authentication or a course catalog.
•
Return consistent response DTOs with meaningful status messages.
•
Use Bean Validation where appropriate.
•
Use centralized exception handling for malformed requests.
•
Avoid unnecessary frameworks, Lombok, security, Docker, frontend or infrastructure.
TESTS:
Write JUnit 5 tests for:
1.
Successful enrollment with available capacity.
2.
Full capacity resulting in waitlisting.
3.
Duplicate enrollment requests.
4.
Duplicate waitlist requests.
5.
FIFO promotion after a drop.
6.
Prerequisite failure.
7.
Ineligible learner skipped during promotion.
8.
Invalid learner ID.
9.
Dropping a learner who is not enrolled.
10.
Repeated drops.
11.
Enrollment count never exceeding capacity.
12.
No learner simultaneously enrolled and waitlisted.
13.
Concurrent enrollment requests with capacity constraints.
14.
Queue fairness when a seat becomes available.
DOCUMENTATION:
Create README.md with prerequisites, setup instructions, build commands, run commands, endpoint documentation, example requests/responses, and test commands.
Create DESIGN.md with service boundary, data structures, API contracts, invariants, prerequisite assumptions, waitlist promotion rules, concurrency strategy, and limitations/tradeoffs.
Create AI_USAGE.md as a truthful documentation template with sections for actual AI prompts, response summaries, accepted/edited/rejected suggestions, impacted files, independent review notes, and verification evidence. Record this prompt as an AI request, but do not fabricate review decisions, test results, or claims that I have independently verified the code.
Create LIMITATIONS.md covering in-memory persistence, restart behavior, one-course scope, and other genuine limitations.
VERIFICATION:
Run Maven compilation and tests if terminal execution is available. Fix compilation errors. Report actual test results. If commands cannot be executed, explicitly state that verification remains pending.
WORKFLOW:
First summarize the proposed classes and design decisions.
Then implement the minimal production code.
Then implement focused tests.
Then create documentation.
Finally review the implementation for edge cases and report what I should manually inspect.
Do not implement unrelated features. Prioritize correctness, simplicity, FIFO behavior, independent verification and assessment acceptance criteria.
```

## Known limitations / verify before submission

- Scope is one course offering, not a course catalog.
- If the service uses in-memory collections, data is lost on restart.
- Concurrency behavior, prerequisite skip/retain policy, and API response statuses must be confirmed against the implementation.
- UI is optional and outside the PDF's required assessment scope.
