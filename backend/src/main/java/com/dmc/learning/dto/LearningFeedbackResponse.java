package com.dmc.learning.dto;

import java.time.OffsetDateTime;
import java.util.List;

public record LearningFeedbackResponse(
        String feedbackText,
        List<String> focusTopics,
        List<String> strengths,
        OffsetDateTime generatedAt
) {
}

