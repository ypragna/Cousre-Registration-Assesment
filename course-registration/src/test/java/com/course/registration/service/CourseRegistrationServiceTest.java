package com.course.registration.service;

import com.course.registration.dto.CourseStateResponse;
import com.course.registration.dto.RegistrationResponse;
import com.course.registration.exception.InvalidRequestException;
import com.course.registration.exception.UnknownLearnerException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class CourseRegistrationServiceTest {

    private CourseRegistrationService service;

    @BeforeEach
    void setUp() {
        service = new CourseRegistrationService("COURSE-TEST", 2);
    }

    @Test
    void enrollsEligibleLearnerWhenCapacityIsAvailable() {
        register("learner-1", true);

        RegistrationResponse response = service.enroll("learner-1");

        assertEquals("ENROLLED", response.status());
        assertEquals(List.of("learner-1"), service.getCourseState().enrolledLearnerIds());
    }

    @Test
    void putsEligibleLearnerOnWaitlistWhenCourseIsFull() {
        fillCourse();
        register("learner-3", true);

        RegistrationResponse response = service.enroll("learner-3");

        assertEquals("WAITLISTED", response.status());
        assertEquals(1, response.waitlistPosition());
        assertEquals(List.of("learner-3"), service.getCourseState().waitlistedLearnerIds());
    }

    @Test
    void duplicateEnrollmentDoesNotCreateDuplicateState() {
        register("learner-1", true);
        service.enroll("learner-1");

        assertEquals("ALREADY_ENROLLED", service.enroll("learner-1").status());
        assertEquals(1, service.getCourseState().enrolledCount());
    }

    @Test
    void duplicateWaitlistRequestDoesNotCreateDuplicateEntry() {
        fillCourse();
        register("learner-3", true);
        service.enroll("learner-3");

        assertEquals("ALREADY_WAITLISTED", service.enroll("learner-3").status());
        assertEquals(List.of("learner-3"), service.getCourseState().waitlistedLearnerIds());
    }

    @Test
    void promotesWaitlistedLearnersInFifoOrderAfterDrops() {
        fillCourse();
        register("learner-3", true);
        register("learner-4", true);
        service.enroll("learner-3");
        service.enroll("learner-4");

        service.drop("learner-1");
        assertTrue(service.getCourseState().enrolledLearnerIds().contains("learner-3"));
        assertEquals(List.of("learner-4"), service.getCourseState().waitlistedLearnerIds());

        service.drop("learner-2");
        assertTrue(service.getCourseState().enrolledLearnerIds().contains("learner-4"));
        assertTrue(service.getCourseState().waitlistedLearnerIds().isEmpty());
    }

    @Test
    void doesNotEnrollLearnerWhosePrerequisitesAreNotSatisfied() {
        register("learner-1", false);

        assertEquals("PREREQUISITES_NOT_MET", service.enroll("learner-1").status());
        assertTrue(service.getCourseState().enrolledLearnerIds().isEmpty());
        assertTrue(service.getCourseState().waitlistedLearnerIds().isEmpty());
    }

    @Test
    void skipsLearnerWhoseEligibilityChangesBeforePromotion() {
        service = new CourseRegistrationService("COURSE-TEST", 1);
        register("learner-1", true);
        register("learner-2", true);
        register("learner-3", true);
        service.enroll("learner-1");
        service.enroll("learner-2");
        service.enroll("learner-3");
        service.updateEligibility("learner-2", false);

        RegistrationResponse dropResponse = service.drop("learner-1");

        assertEquals(List.of("learner-3"), dropResponse.promotedLearnerIds());
        assertEquals(List.of("learner-3"), service.getCourseState().enrolledLearnerIds());
        assertTrue(service.getCourseState().waitlistedLearnerIds().isEmpty());
    }

    @Test
    void rejectsMalformedLearnerId() {
        assertThrows(InvalidRequestException.class, () -> service.enroll("bad learner"));
    }

    @Test
    void rejectsUnknownLearner() {
        assertThrows(UnknownLearnerException.class, () -> service.enroll("unknown"));
    }

    @Test
    void droppingLearnerWhoIsNotEnrolledReturnsClearResult() {
        register("learner-1", true);

        assertEquals("NOT_ENROLLED", service.drop("learner-1").status());
    }

    @Test
    void repeatedDropReturnsNotEnrolledWithoutChangingState() {
        register("learner-1", true);
        service.enroll("learner-1");
        service.drop("learner-1");

        assertEquals("NOT_ENROLLED", service.drop("learner-1").status());
        assertTrue(service.getCourseState().enrolledLearnerIds().isEmpty());
    }

    @Test
    void enrollmentCountNeverExceedsCapacity() {
        service = new CourseRegistrationService("COURSE-TEST", 2);
        for (int i = 1; i <= 20; i++) {
            register("learner-" + i, true);
            service.enroll("learner-" + i);
            assertTrue(service.getCourseState().enrolledCount() <= service.getCourseState().capacity());
        }
    }

    @Test
    void learnerCannotBeEnrolledAndWaitlistedAtTheSameTime() {
        fillCourse();
        register("learner-3", true);
        service.enroll("learner-3");

        CourseStateResponse state = service.getCourseState();
        List<String> intersection = new ArrayList<>(state.enrolledLearnerIds());
        intersection.retainAll(state.waitlistedLearnerIds());
        assertTrue(intersection.isEmpty());
    }

    @Test
    void concurrentEnrollmentRequestsRespectCapacity() throws Exception {
        int capacity = 4;
        int learnerCount = 40;
        service = new CourseRegistrationService("COURSE-TEST", capacity);
        for (int i = 0; i < learnerCount; i++) {
            register("learner-" + i, true);
        }

        ExecutorService executor = Executors.newFixedThreadPool(8);
        CountDownLatch start = new CountDownLatch(1);
        try {
            List<Future<RegistrationResponse>> results = new ArrayList<>();
            for (int i = 0; i < learnerCount; i++) {
                String learnerId = "learner-" + i;
                results.add(executor.submit(() -> {
                    start.await();
                    return service.enroll(learnerId);
                }));
            }
            start.countDown();
            for (Future<RegistrationResponse> result : results) {
                result.get();
            }
        } finally {
            executor.shutdownNow();
        }

        CourseStateResponse state = service.getCourseState();
        assertEquals(capacity, state.enrolledCount());
        assertEquals(learnerCount - capacity, state.waitlistedLearnerIds().size());
        assertTrue(state.enrolledCount() <= capacity);
        assertFalse(state.enrolledLearnerIds().stream().anyMatch(state.waitlistedLearnerIds()::contains));
    }

    @Test
    void newcomersJoinBehindExistingWaitlistAfterSeatIsFreed() {
        service = new CourseRegistrationService("COURSE-TEST", 1);
        register("learner-1", true);
        register("learner-2", true);
        register("learner-3", true);
        register("learner-4", true);
        service.enroll("learner-1");
        service.enroll("learner-2");
        service.enroll("learner-3");

        service.drop("learner-1");
        RegistrationResponse newcomerResponse = service.enroll("learner-4");

        assertEquals("WAITLISTED", newcomerResponse.status());
        assertEquals(List.of("learner-2"), service.getCourseState().enrolledLearnerIds());
        assertEquals(List.of("learner-3", "learner-4"), service.getCourseState().waitlistedLearnerIds());
    }

    private void fillCourse() {
        register("learner-1", true);
        register("learner-2", true);
        service.enroll("learner-1");
        service.enroll("learner-2");
    }

    private void register(String learnerId, boolean prerequisitesSatisfied) {
        service.registerLearner(learnerId, prerequisitesSatisfied);
    }
}
