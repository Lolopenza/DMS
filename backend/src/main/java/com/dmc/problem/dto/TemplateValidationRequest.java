package com.dmc.problem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record TemplateValidationRequest(
        Long templateId,
        @NotBlank String question,
        @NotNull JsonNode parameters,
        @NotBlank String answerExpression,
        @NotBlank String operation,
        @NotNull JsonNode candidateAnswer
) {
}
