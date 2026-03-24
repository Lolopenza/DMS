package com.dmc.learning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record LessonDto(
        Long id,
        @NotNull Long moduleId,
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String slug,
        String contentText,
        @Size(max = 512) String contentVideoUrl,
        Boolean freeOnly,
        Integer orderIndex
) {
}
