package com.dmc.learning.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

public record LearningFeedbackRequest(
        @Min(1) @Max(365) Integer windowDays,
        @Min(1) @Max(20) Integer topNTopics
) {
}

