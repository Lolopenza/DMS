package com.dmc.problem.dto;

import com.dmc.problem.entity.Difficulty;
import com.fasterxml.jackson.databind.JsonNode;

public record ProblemTemplateDto(
        Long id,
        String title,
        String topicSlug,
        Difficulty difficulty,
        String operation,
        String questionTemplate,
        JsonNode parametersSchema,
        String answerExpression,
        Boolean active
) {
}
