package com.dmc.problem.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record TopicDto(
        Long id,
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Size(max = 120) String slug,
        Long parentId
) {
}
