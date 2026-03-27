package com.dmc.analytics.dto;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;

public record BktAnalyticsSummaryResponse(
        Long userId,
        int windowDays,
        OffsetDateTime windowStart,
        OffsetDateTime windowEnd,
        List<SkillSummaryItem> skills,
        AttemptAggregates attemptAggregates,
        List<TopicKpiItem> topicKpis,
        List<DailyAccuracyPoint> dailyAccuracy,
        Map<String, Integer> errorTypeBreakdown,
        StabilityFlags stabilityFlags
) {
    public record SkillSummaryItem(
            String topicSlug,
            double pKnow,
            String masteryLevel,
            int totalAttempts,
            int correctAttempts,
            OffsetDateTime updatedAt
    ) {
    }

    public record AttemptAggregates(
            int generatedAttemptsTotal,
            int generatedAttemptsCorrect,
            int generatedAttemptsIncorrect,
            double avgTimeSpentSeconds,
            double p50TimeSpentSeconds,
            double p90TimeSpentSeconds,
            Map<String, Integer> verificationMethodCounts
    ) {
    }

    public record TopicKpiItem(
            String topicSlug,
            int attemptsTotal,
            int correctAttempts,
            double successRate,
            double avgTimeSpentSeconds,
            double p50TimeSpentSeconds,
            double p90TimeSpentSeconds
    ) {
    }

    public record DailyAccuracyPoint(
            LocalDate day,
            int attemptsTotal,
            int correctAttempts,
            double accuracy
    ) {
    }

    public record StabilityFlags(
            boolean stableAccuracy,
            String speedVsAccuracyTrend
    ) {
    }
}

