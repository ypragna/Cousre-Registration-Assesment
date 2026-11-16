package com.course.registration.exception;

public class UnknownLearnerException extends RuntimeException {

    public UnknownLearnerException(String learnerId) {
        super("Unknown learner ID: " + learnerId);
    }
}
