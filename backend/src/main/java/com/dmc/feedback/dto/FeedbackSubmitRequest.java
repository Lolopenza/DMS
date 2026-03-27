package com.dmc.feedback.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;

public record FeedbackSubmitRequest(
        @Min(1) @Max(5) Integer rating,
        @Size(max = 2000) String comment,
        @Size(max = 100) String source
) {
}
