package com.course.registration.model;

public record CourseOffering(String id, int capacity) {

    public CourseOffering {
        if (id == null || id.isBlank()) {
            throw new IllegalArgumentException("Course ID must not be blank.");
        }
        if (capacity <= 0) {
            throw new IllegalArgumentException("Course capacity must be positive.");
        }
    }
}
