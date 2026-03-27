package com.dmc.feedback.service;

import com.dmc.common.exception.ApiException;
import com.dmc.feedback.config.FeedbackProperties;
import com.dmc.feedback.dto.FeedbackStatusResponse;
import com.dmc.feedback.dto.FeedbackSubmitRequest;
import com.dmc.feedback.entity.StudentFeedback;
import com.dmc.feedback.repository.StudentFeedbackRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentFeedbackService {

    private final StudentFeedbackRepository feedbackRepository;
    private final UserRepository userRepository;
    private final FeedbackProperties feedbackProperties;

    public FeedbackStatusResponse getStatus(Long userId) {
        boolean hasSubmitted = feedbackRepository.existsByUserId(userId);
        return new FeedbackStatusResponse(
                hasSubmitted,
                !hasSubmitted,
                feedbackProperties.promptDelaySeconds()
        );
    }

    @Transactional
    public void submit(Long userId, FeedbackSubmitRequest request) {
        if (feedbackRepository.existsByUserId(userId)) {
            throw new ApiException(HttpStatus.CONFLICT, "FEEDBACK_ALREADY_SUBMITTED", "Feedback already submitted");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        StudentFeedback feedback = StudentFeedback.builder()
                .user(user)
                .rating(request.rating())
                .comment(request.comment())
                .source(request.source())
                .build();

        feedbackRepository.save(feedback);
    }
}
