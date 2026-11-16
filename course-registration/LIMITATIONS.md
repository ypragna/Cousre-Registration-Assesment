# Limitations

- **In-memory persistence:** Learners, eligibility, enrollments, and waitlist entries exist only in the running process.
- **Restart behavior:** Restarting the application clears all state; there is no persistence or recovery.
- **One-course scope:** The service exposes exactly one configured course offering. It is not a course catalog or multi-course registration platform.
- **Prerequisite source:** Eligibility is a caller-provided boolean, not calculated from course history or an external system.
- **Eligibility changes:** A change does not automatically cancel an existing enrollment. Waitlisted learners are rechecked when considered for promotion.
- **Single-process synchronization:** `synchronized` protects state within one service instance, but does not coordinate multiple server processes or replicas.
- **Waitlist size:** The in-memory FIFO queue has no configured length limit.
- **No identity or authorization:** Learner IDs and eligibility updates are not authenticated; this is an assessment implementation, not a production security model.
