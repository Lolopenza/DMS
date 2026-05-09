package com.dmc.gamification.dto;

import java.util.List;

public record GamificationSummaryDto(
        int streakDays,
        boolean streakActive,
        DailyGoalDto dailyGoal,
        List<AchievementItemDto> recentAchievements,
        List<AchievementItemDto> allAchievements
) {
}
