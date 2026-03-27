package com.dmc.analytics.dto;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

public record RawLearningAnalyticsDatasetResponse(
        Long userId,
        int windowDays,
        OffsetDateTime windowStart,
        OffsetDateTime windowEnd,
        List<AttemptRow> attempts,
        Map<String, Object> metadata
) {
    public record AttemptRow(
            String source,
            String topicSlug,
            String topicPath,
            String difficultyAtAttempt,
            Double difficultyScore,
            boolean correct,
            Integer timeSpentSeconds,
            Integer timeToFirstActionSeconds,
            boolean hintUsed,
            String errorType,
            Integer attemptIndexWithinTopic,
            Integer retryCountForProblem,
            Integer hourOfDay,
            Integer dayOfWeek,
            Boolean lateNight,
            OffsetDateTime createdAt
    ) {
    }
}
