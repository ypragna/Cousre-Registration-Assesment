package com.course.registration.dto;

import java.util.List;

public record CourseStateResponse(
        String courseId,
        int capacity,
        int enrolledCount,
        List<String> enrolledLearnerIds,
        List<String> waitlistedLearnerIds) {
}
