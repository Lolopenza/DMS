package com.dmc.problem.dto;

import jakarta.validation.constraints.Size;

public record InteractiveProblemGenerateRequest(
        Long templateId,
        @Size(max = 120) String topicSlug,
        @Size(max = 20) String difficulty,
        @Size(max = 30) String skillLevel,
        @Size(max = 20) String mode,
        /** Optional override; when null, server uses the user's saved career track. */
        @Size(max = 30) String careerTrack
) {
}
