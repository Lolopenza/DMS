package com.dmc.problem.dto;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;

public record ProblemAttemptRequest(
        @NotNull JsonNode answer
) {
}
