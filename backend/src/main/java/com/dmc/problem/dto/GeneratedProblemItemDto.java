package com.dmc.problem.dto;

import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.GenerationMode;
import com.fasterxml.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

public record GeneratedProblemItemDto(
        Long id,
        Long templateId,
        GenerationMode generationMode,
        String sourceModel,
        String topicSlug,
        Difficulty difficulty,
        BigDecimal difficultyScore,
        String questionText,
        JsonNode params,
        Integer attemptCount,
        Integer correctCount,
        OffsetDateTime createdAt,
        /** Career narrative used for AI generation; null for template problems or legacy rows. */
        String careerTrack
) {
}
