package com.course.registration.dto;

import jakarta.validation.constraints.NotNull;

public record EligibilityRequest(@NotNull Boolean prerequisitesSatisfied) {
}
