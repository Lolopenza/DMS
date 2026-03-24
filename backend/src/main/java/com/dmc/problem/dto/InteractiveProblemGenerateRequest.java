package com.dmc.problem.dto;

public record InteractiveProblemGenerateRequest(
        Long templateId,
        String topicSlug,
        String difficulty,
        String skillLevel,
        String mode
) {
}
