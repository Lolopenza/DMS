package com.dmc.problem.dto;

import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.ProblemType;
import com.fasterxml.jackson.databind.JsonNode;

import java.util.Set;

public record ProblemDto(
        Long id,
        String title,
        ProblemType type,
        Difficulty difficulty,
        String topic,
        String questionText,
        JsonNode correctAnswer,
        String hintText,
        String explanationText,
        Integer xpReward,
        Boolean freeOnly,
        Set<String> topicSlugs
) {
}
