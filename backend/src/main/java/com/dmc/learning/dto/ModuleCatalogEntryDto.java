package com.dmc.learning.dto;

/**
 * Calculator catalog row for mapping route {@code /{subjectSlug}/{moduleSlug}} to practice topic slug (BKT skill).
 */
public record ModuleCatalogEntryDto(
        String subjectSlug,
        String moduleSlug,
        String skillTopicSlug,
        String displayName
) {
}
