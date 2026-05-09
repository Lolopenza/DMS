package com.dmc.learning.dto;

/**
 * Deep-link target for journey CTA: {@code /{subjectSlug}/{moduleSlug}}.
 */
public record JourneyNextModuleDto(
        String moduleSlug,
        String subjectSlug,
        String displayName
) {
}
