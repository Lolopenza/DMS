package com.dmc.learning.dto;

/**
 * Weakest practice topic by reliability-adjusted Bayesian mastery among {@link com.dmc.learning.config.PracticeTopics}.
 */
public record AdaptivePracticeTopicDto(
        String topicSlug,
        double adjustedPknow,
        String reason
) {
}
