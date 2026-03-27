package com.dmc.feedback.dto;

public record FeedbackStatusResponse(
        boolean hasSubmitted,
        boolean shouldPrompt,
        int promptDelaySeconds
) {
}
