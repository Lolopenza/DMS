package com.dmc.problem.dto;

import com.fasterxml.jackson.databind.JsonNode;

public record ProblemAttemptRequest(
        JsonNode answer
) {
}
