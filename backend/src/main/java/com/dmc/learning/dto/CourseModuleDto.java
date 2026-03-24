package com.dmc.learning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CourseModuleDto(
        Long id,
        @NotNull Long courseId,
        @NotBlank @Size(max = 255) String title,
        Integer orderIndex
) {
}
