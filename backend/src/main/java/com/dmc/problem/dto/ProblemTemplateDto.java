package com.dmc.problem.dto;

import com.dmc.problem.entity.Difficulty;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProblemTemplateDto(
        Long id,
        @NotBlank @Size(max = 255) String title,
        @Size(max = 120) String topicSlug,
        Difficulty difficulty,
        @NotBlank @Size(max = 100) String operation,
        @NotBlank String questionTemplate,
        JsonNode parametersSchema,
        @NotBlank String answerExpression,
        Boolean active
) {
}
