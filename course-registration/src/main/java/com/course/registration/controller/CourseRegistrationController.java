package com.course.registration.controller;

import com.course.registration.dto.CourseStateResponse;
import com.course.registration.dto.CreateLearnerRequest;
import com.course.registration.dto.EligibilityRequest;
import com.course.registration.dto.RegistrationResponse;
import com.course.registration.service.CourseRegistrationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api")
public class CourseRegistrationController {

    private final CourseRegistrationService service;

    public CourseRegistrationController(CourseRegistrationService service) {
        this.service = service;
    }

    @PostMapping("/learners")
    public ResponseEntity<RegistrationResponse> registerLearner(
            @Valid @RequestBody CreateLearnerRequest request) {
        RegistrationResponse response = service.registerLearner(
                request.learnerId(), request.prerequisitesSatisfied());
        if (response.status().equals("LEARNER_ALREADY_EXISTS")) {
            return ResponseEntity.status(HttpStatus.CONFLICT).body(response);
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/learners/{learnerId}/eligibility")
    public RegistrationResponse updateEligibility(
            @PathVariable String learnerId,
            @Valid @RequestBody EligibilityRequest request) {
        return service.updateEligibility(learnerId, request.prerequisitesSatisfied());
    }

    @PostMapping("/enrollments/{learnerId}")
    public RegistrationResponse enroll(@PathVariable String learnerId) {
        return service.enroll(learnerId);
    }

    @DeleteMapping("/enrollments/{learnerId}")
    public RegistrationResponse drop(@PathVariable String learnerId) {
        return service.drop(learnerId);
    }

    @GetMapping("/course")
    public CourseStateResponse getCourseState() {
        return service.getCourseState();
    }
}
