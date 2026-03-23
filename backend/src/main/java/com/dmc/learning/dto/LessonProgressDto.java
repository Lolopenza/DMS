package com.dmc.learning.dto;

import java.time.OffsetDateTime;

public record LessonProgressDto(
        Long lessonId,
        OffsetDateTime completedAt
) {
}
