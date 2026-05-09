package com.dmc.learning.dto;

/**
 * Personalized calculator module recommendation derived from BKT skills + prerequisite graph.
 */
public record ModuleRecommendationDto(
        String moduleSlug,
        String moduleName,
        String subject,
        String reason,
        int estimatedMinutes,
        String difficultyLevel,
        boolean prerequisitesMet,
        double score
) {
}
