package com.dmc.feedback.controller;

import com.dmc.common.exception.ApiException;
import com.dmc.common.security.UserPrincipal;
import com.dmc.feedback.dto.FeedbackStatusResponse;
import com.dmc.feedback.dto.FeedbackSubmitRequest;
import com.dmc.feedback.service.StudentFeedbackService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/feedback")
@RequiredArgsConstructor
public class FeedbackController {

    private final StudentFeedbackService feedbackService;

    @GetMapping("/status")
    public ResponseEntity<FeedbackStatusResponse> status() {
        return ResponseEntity.ok(feedbackService.getStatus(currentUserId()));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> submit(@Valid @RequestBody FeedbackSubmitRequest request) {
        feedbackService.submit(currentUserId(), request);
        return ResponseEntity.ok(Map.of("status", "submitted"));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
        }
        return principal.getId();
    }
}
