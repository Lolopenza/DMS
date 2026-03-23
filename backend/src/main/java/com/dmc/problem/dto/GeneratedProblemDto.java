package com.dmc.problem.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record GeneratedProblemDto(
        Long templateId,
        String question,
        JsonNode parameters,
        String answerExpression,
        String operation
) {
}
