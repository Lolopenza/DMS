package com.dmc.problem.dto;

import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.ProblemType;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record ProblemDto(
        Long id,
        @NotBlank @Size(max = 255) String title,
        ProblemType type,
        Difficulty difficulty,
        @Size(max = 100) String topic,
        @NotBlank String questionText,
        JsonNode correctAnswer,
        String hintText,
        String explanationText,
        Integer xpReward,
        Boolean freeOnly,
        Set<String> topicSlugs
) {
}
