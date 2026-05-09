package com.dmc.gamification.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Defaults are set in application.yml; values must be positive where enforced in {@link com.dmc.gamification.service.GamificationService}.
 */
@ConfigurationProperties(prefix = "dmc.gamification")
public record GamificationProperties(
        int dailyGoalTarget,
        int masteryKingModulesRequired,
        int streakLookbackDays
) {
}
