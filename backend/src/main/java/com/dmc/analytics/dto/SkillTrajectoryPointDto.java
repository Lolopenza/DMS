package com.dmc.analytics.dto;

/**
 * One observation: BKT P(L) immediately after applying this attempt (same rule as {@link com.dmc.problem.service.BktService}).
 */
public record SkillTrajectoryPointDto(
        String createdAt,
        boolean correct,
        int pKnowPercent
) {
}
