package com.course.registration.service;

import com.course.registration.dto.CourseStateResponse;
import com.course.registration.dto.RegistrationResponse;
import com.course.registration.exception.InvalidRequestException;
import com.course.registration.exception.UnknownLearnerException;
import com.course.registration.model.CourseOffering;
import com.course.registration.model.Learner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Queue;
import java.util.Set;

@Service
public class CourseRegistrationService {

    private final CourseOffering course;
    private final Map<String, Learner> learners = new HashMap<>();
    private final Set<String> enrolledLearnerIds = new LinkedHashSet<>();
    private final Queue<String> waitlist = new ArrayDeque<>();

    public CourseRegistrationService(
            @Value("${course.id:COURSE-101}") String courseId,
            @Value("${course.capacity:3}") int capacity) {
        this.course = new CourseOffering(courseId, capacity);
    }

    public synchronized RegistrationResponse registerLearner(String learnerId, boolean prerequisitesSatisfied) {
        validateLearnerId(learnerId);
        if (learners.containsKey(learnerId)) {
            return response("LEARNER_ALREADY_EXISTS", "Learner is already registered.", learnerId, null, List.of());
        }
        learners.put(learnerId, new Learner(learnerId, prerequisitesSatisfied));
        return response("LEARNER_REGISTERED", "Learner registered.", learnerId, null, List.of());
    }

    public synchronized RegistrationResponse updateEligibility(String learnerId, boolean prerequisitesSatisfied) {
        validateLearnerId(learnerId);
        Learner learner = requireLearner(learnerId);
        learners.put(learnerId, new Learner(learner.id(), prerequisitesSatisfied));
        return response("ELIGIBILITY_UPDATED", "Learner prerequisite eligibility updated.", learnerId, null, List.of());
    }

    public synchronized RegistrationResponse enroll(String learnerId) {
        validateLearnerId(learnerId);
        Learner learner = requireLearner(learnerId);

        if (enrolledLearnerIds.contains(learnerId)) {
            return response("ALREADY_ENROLLED", "Learner is already enrolled.", learnerId, null, List.of());
        }
        if (waitlist.contains(learnerId)) {
            return response("ALREADY_WAITLISTED", "Learner is already on the waitlist.", learnerId,
                    waitlistPosition(learnerId), List.of());
        }
        if (!learner.prerequisitesSatisfied()) {
            return response("PREREQUISITES_NOT_MET", "Learner does not satisfy the course prerequisites.",
                    learnerId, null, List.of());
        }

        promoteWaitlist();
        if (enrolledLearnerIds.size() < course.capacity()) {
            enrolledLearnerIds.add(learnerId);
            return response("ENROLLED", "Learner enrolled successfully.", learnerId, null, List.of());
        }

        waitlist.add(learnerId);
        return response("WAITLISTED", "Course is full; learner added to the FIFO waitlist.", learnerId,
                waitlist.size(), List.of());
    }

    public synchronized RegistrationResponse drop(String learnerId) {
        validateLearnerId(learnerId);
        requireLearner(learnerId);
        if (!enrolledLearnerIds.remove(learnerId)) {
            return response("NOT_ENROLLED", "Learner is not currently enrolled.", learnerId, null, List.of());
        }

        List<String> promotedLearnerIds = promoteWaitlist();
        String message = promotedLearnerIds.isEmpty()
                ? "Enrollment dropped; no eligible learner was available for promotion."
                : "Enrollment dropped; eligible waitlisted learner(s) promoted.";
        return response("DROPPED", message, learnerId, null, promotedLearnerIds);
    }

    public synchronized CourseStateResponse getCourseState() {
        return new CourseStateResponse(course.id(), course.capacity(), enrolledLearnerIds.size(),
                List.copyOf(enrolledLearnerIds), List.copyOf(waitlist));
    }

    private List<String> promoteWaitlist() {
        List<String> promotedLearnerIds = new ArrayList<>();
        while (enrolledLearnerIds.size() < course.capacity() && !waitlist.isEmpty()) {
            String learnerId = waitlist.remove();
            Learner learner = learners.get(learnerId);
            if (learner != null && learner.prerequisitesSatisfied()) {
                enrolledLearnerIds.add(learnerId);
                promotedLearnerIds.add(learnerId);
            }
        }
        return promotedLearnerIds;
    }

    private Learner requireLearner(String learnerId) {
        Learner learner = learners.get(learnerId);
        if (learner == null) {
            throw new UnknownLearnerException(learnerId);
        }
        return learner;
    }

    private void validateLearnerId(String learnerId) {
        if (learnerId == null || !learnerId.matches("[A-Za-z0-9_-]{1,64}")) {
            throw new InvalidRequestException(
                    "Learner ID must contain 1-64 letters, digits, underscores, or hyphens.");
        }
    }

    private Integer waitlistPosition(String learnerId) {
        int position = 1;
        for (String queuedLearnerId : waitlist) {
            if (queuedLearnerId.equals(learnerId)) {
                return position;
            }
            position++;
        }
        return null;
    }

    private RegistrationResponse response(
            String status,
            String message,
            String learnerId,
            Integer waitlistPosition,
            List<String> promotedLearnerIds) {
        return new RegistrationResponse(status, message, course.id(), learnerId, enrolledLearnerIds.size(),
                course.capacity(), waitlistPosition, List.copyOf(promotedLearnerIds));
    }
}
