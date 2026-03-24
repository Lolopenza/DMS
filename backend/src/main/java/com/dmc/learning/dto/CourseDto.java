package com.dmc.learning.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CourseDto(
        Long id,
        @NotBlank @Size(max = 255) String title,
        @NotBlank @Size(max = 255) String slug,
        String description,
        Integer orderIndex,
        Boolean published
) {
}
