package com.dmc.gamification.dto;

public record AchievementItemDto(
        String id,
        String name,
        String description,
        String icon,
        boolean earned,
        String progress,
        int sortOrder
) {
}
