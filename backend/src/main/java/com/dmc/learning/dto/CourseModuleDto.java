package com.dmc.learning.dto;

public record CourseModuleDto(
        Long id,
        Long courseId,
        String title,
        Integer orderIndex
) {
}
