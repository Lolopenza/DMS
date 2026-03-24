package com.dmc.problem.dto;

import java.time.OffsetDateTime;

public record StudentSkillDto(
        Long id,
        String topicSlug,
        double pKnow,
        double pGuess,
        double pSlip,
        double pTransit,
        int totalAttempts,
        int correctAttempts,
        String masteryLevel,
        OffsetDateTime updatedAt
) {
}
