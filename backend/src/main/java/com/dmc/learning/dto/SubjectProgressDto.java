package com.dmc.learning.dto;

/**
 * Aggregated adjusted BKT mastery for one subject track (calculator modules grouped by {@code subjectSlug}).
 */
public record SubjectProgressDto(
        String subjectSlug,
        String displayName,
        int subjectMasteryPercent,
        int completedModules,
        int totalModules
) {
}
