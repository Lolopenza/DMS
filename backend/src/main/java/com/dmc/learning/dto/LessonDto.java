package com.dmc.learning.dto;

public record LessonDto(
        Long id,
        Long moduleId,
        String title,
        String slug,
        String contentText,
        String contentVideoUrl,
        Boolean freeOnly,
        Integer orderIndex
) {
}
