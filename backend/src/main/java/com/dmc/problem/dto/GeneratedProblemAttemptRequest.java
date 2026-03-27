package com.dmc.problem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public record GeneratedProblemAttemptRequest(
        @NotNull JsonNode answer,
        @Min(0) Integer timeSpentSeconds,
        @Min(0) Integer timeToFirstActionSeconds,
        Boolean hintUsed,
        String errorType,
        String difficultyAtAttempt,
        String topicSlug,
        String topicPath
) {
}
