package com.dmc.gamification.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Set;

import static org.assertj.core.api.Assertions.assertThat;

class GamificationServiceTest {

    @Test
    void streakCountsFromTodayWhenActiveToday() {
        LocalDate today = LocalDate.of(2026, 5, 1);
        Set<LocalDate> active = Set.of(
                today.minusDays(2),
                today.minusDays(1),
                today
        );
        assertThat(GamificationService.computeStreakDays(active, today)).isEqualTo(3);
    }

    @Test
    void streakCountsFromYesterdayWhenTodayQuiet() {
        LocalDate today = LocalDate.of(2026, 5, 1);
        Set<LocalDate> active = Set.of(today.minusDays(1), today.minusDays(2));
        assertThat(GamificationService.computeStreakDays(active, today)).isEqualTo(2);
    }

    @Test
    void streakZeroWhenGapBeforeYesterday() {
        LocalDate today = LocalDate.of(2026, 5, 1);
        Set<LocalDate> active = Set.of(today.minusDays(3));
        assertThat(GamificationService.computeStreakDays(active, today)).isEqualTo(0);
    }
}
