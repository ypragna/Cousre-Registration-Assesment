package com.course.registration.exception;

import com.course.registration.dto.ApiErrorResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(InvalidRequestException.class)
    public ResponseEntity<ApiErrorResponse> handleInvalidRequest(InvalidRequestException exception) {
        return ResponseEntity.badRequest().body(error(HttpStatus.BAD_REQUEST, exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(UnknownLearnerException.class)
    public ResponseEntity<ApiErrorResponse> handleUnknownLearner(UnknownLearnerException exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(error(HttpStatus.NOT_FOUND, exception.getMessage(), Map.of()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiErrorResponse> handleValidation(MethodArgumentNotValidException exception) {
        Map<String, String> validationErrors = new LinkedHashMap<>();
        exception.getBindingResult().getFieldErrors().forEach(fieldError ->
                validationErrors.putIfAbsent(fieldError.getField(), fieldError.getDefaultMessage()));
        return ResponseEntity.badRequest()
                .body(error(HttpStatus.BAD_REQUEST, "Request validation failed.", validationErrors));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ApiErrorResponse> handleUnreadableRequest(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest()
                .body(error(HttpStatus.BAD_REQUEST, "Request body is malformed or missing required values.", Map.of()));
    }

    private ApiErrorResponse error(HttpStatus status, String message, Map<String, String> validationErrors) {
        return new ApiErrorResponse(status.value(), message, validationErrors);
    }
}
