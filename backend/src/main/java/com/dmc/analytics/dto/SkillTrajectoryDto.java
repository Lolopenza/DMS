package com.dmc.analytics.dto;

import java.util.List;

/**
 * BKT P(L) replay for one skill topic. {@code adjustedMasteryPercent} matches the student dashboard (reliability); {@code storedPknowPercent} is raw P(know) in DB.
 */
public record SkillTrajectoryDto(
        String topicSlug,
        String topicLabel,
        int windowDays,
        int adjustedMasteryPercent,
        int storedPknowPercent,
        int attemptCountInWindow,
        List<SkillTrajectoryPointDto> points
) {
}
