package com.course.registration.dto;

import java.util.List;

public record RegistrationResponse(
        String status,
        String message,
        String courseId,
        String learnerId,
        int enrolledCount,
        int capacity,
        Integer waitlistPosition,
        List<String> promotedLearnerIds) {
}
