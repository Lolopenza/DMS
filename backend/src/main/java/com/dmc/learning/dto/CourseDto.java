package com.dmc.learning.dto;

public record CourseDto(
        Long id,
        String title,
        String slug,
        String description,
        Integer orderIndex,
        Boolean published
) {
}
