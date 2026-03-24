package com.dmc.problem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record GeneratedProblemAttemptRequest(
        @NotNull JsonNode answer
) {
}
