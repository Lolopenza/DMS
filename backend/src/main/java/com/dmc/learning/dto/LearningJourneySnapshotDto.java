package com.dmc.learning.dto;

/**
 * Dashboard "learning journey" card: global module completion vs catalog size + next recommended module.
 */
public record LearningJourneySnapshotDto(
        String currentGoal,
        int completedModules,
        int totalModules,
        JourneyNextModuleDto nextModule
) {
}
