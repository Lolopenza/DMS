package com.dmc.problem.dto;

import java.math.BigDecimal;

public record GeneratedProblemAttemptResponse(
        Long generatedProblemId,
        boolean correct,
        BigDecimal confidence,
        String verificationMethod,
        String feedback,
        int xpEarned
) {
}
