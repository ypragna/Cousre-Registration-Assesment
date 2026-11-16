package com.course.registration.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;

public record CreateLearnerRequest(
        @NotBlank
        @Pattern(regexp = "[A-Za-z0-9_-]{1,64}", message = "must contain 1-64 letters, digits, underscores, or hyphens")
        String learnerId,
        @NotNull Boolean prerequisitesSatisfied) {
}
