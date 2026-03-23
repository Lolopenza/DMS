package com.dmc.problem.dto;

public record ProblemAttemptResponse(
        Long problemId,
        Boolean correct,
        Integer xpEarned,
        String feedback,
        String explanation
) {
}
