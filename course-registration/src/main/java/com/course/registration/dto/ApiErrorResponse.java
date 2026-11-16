package com.course.registration.dto;

import java.util.Map;

public record ApiErrorResponse(int status, String message, Map<String, String> validationErrors) {
}
