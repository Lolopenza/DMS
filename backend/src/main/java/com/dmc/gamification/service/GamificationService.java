package com.dmc.gamification.service;

import com.dmc.gamification.config.GamificationProperties;
import com.dmc.gamification.dto.AchievementItemDto;
import com.dmc.gamification.dto.DailyGoalDto;
import com.dmc.gamification.dto.GamificationSummaryDto;
import com.dmc.gamification.repository.UserFeatureMilestoneRepository;
import com.dmc.learning.config.ModuleDependencyGraph;
import com.dmc.learning.config.ModuleDependencyGraph.CatalogModule;
import com.dmc.learning.service.LearningProgressService;
import com.dmc.problem.bkt.BktMasteryMath;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.GeneratedProblemAttemptRepository;
import com.dmc.problem.repository.ProblemAttemptRepository;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.dmc.common.exception.ApiException;

import java.time.LocalDate;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GamificationService {

    private static final ZoneOffset ACTIVITY_ZONE = ZoneOffset.UTC;

    private final GamificationProperties properties;
    private final UserRepository userRepository;
    private final ProblemAttemptRepository problemAttemptRepository;
    private final GeneratedProblemAttemptRepository generatedProblemAttemptRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final UserFeatureMilestoneRepository milestoneRepository;

    /**
     * Consecutive practice days (UTC) for use by recommendations and other features.
     */
    public int streakDaysForUser(long userId) {
        User user = userRepository.findById(userId).orElse(null);
        if (user == null) {
            return 0;
        }
        int lookback = Math.max(30, properties.streakLookbackDays());
        OffsetDateTime windowStart = OffsetDateTime.now(ACTIVITY_ZONE).minusDays(lookback);
        ActivitySnapshot snap = collectActivity(user, windowStart);
        LocalDate today = LocalDate.now(ACTIVITY_ZONE);
        return computeStreakDays(snap.activeDates(), today);
    }

    private record ActivitySnapshot(Set<LocalDate> activeDates, int todayCount) {
    }

    private ActivitySnapshot collectActivity(User user, OffsetDateTime windowStart) {
        List<ProblemAttempt> standard = problemAttemptRepository
                .findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(user, windowStart);
        List<GeneratedProblemAttempt> generated = generatedProblemAttemptRepository
                .findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(user, windowStart);

        Set<LocalDate> activeDates = new HashSet<>();
        LocalDate today = LocalDate.now(ACTIVITY_ZONE);
        int todayCount = 0;
        for (ProblemAttempt a : standard) {
            if (a.getCreatedAt() == null) {
                continue;
            }
            LocalDate d = a.getCreatedAt().atZoneSameInstant(ACTIVITY_ZONE).toLocalDate();
            activeDates.add(d);
            if (d.equals(today)) {
                todayCount++;
            }
        }
        for (GeneratedProblemAttempt a : generated) {
            if (a.getCreatedAt() == null) {
                continue;
            }
            LocalDate d = a.getCreatedAt().atZoneSameInstant(ACTIVITY_ZONE).toLocalDate();
            activeDates.add(d);
            if (d.equals(today)) {
                todayCount++;
            }
        }
        return new ActivitySnapshot(activeDates, todayCount);
    }

    public GamificationSummaryDto summaryForUser(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        int lookback = Math.max(30, properties.streakLookbackDays());
        OffsetDateTime windowStart = OffsetDateTime.now(ACTIVITY_ZONE).minusDays(lookback);
        ActivitySnapshot snap = collectActivity(user, windowStart);
        LocalDate today = LocalDate.now(ACTIVITY_ZONE);

        int streakDays = computeStreakDays(snap.activeDates(), today);
        boolean streakActive = snap.activeDates().contains(today);
        int todayCount = snap.todayCount();

        int target = Math.max(1, properties.dailyGoalTarget());
        DailyGoalDto dailyGoal = new DailyGoalDto(todayCount, target);

        long totalAttempts = problemAttemptRepository.countByUser(user) + generatedProblemAttemptRepository.countByUser(user);

        Map<String, StudentSkill> skillByTopic = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .collect(Collectors.toMap(StudentSkill::getTopicSlug, s -> s, (a, b) -> a));

        int modulesAtMastery = 0;
        int totalCatalogModules = ModuleDependencyGraph.modules().size();
        for (CatalogModule m : ModuleDependencyGraph.modules()) {
            int pct = BktMasteryMath.adjustedMasteryPercent(skillByTopic, m.skillTopicSlug());
            if (pct >= LearningProgressService.MODULE_COMPLETE_THRESHOLD_PERCENT) {
                modulesAtMastery++;
            }
        }

        int masteryRequired = Math.max(1, properties.masteryKingModulesRequired());
        boolean hasExportMilestone = milestoneRepository.existsByUserAndFeatureKey(
                user, GamificationMilestoneService.FEATURE_LEARNING_EXPORT);

        List<AchievementItemDto> all = new ArrayList<>();
        all.add(buildFirstSteps(1, totalAttempts));
        all.add(buildWeekWarrior(2, streakDays));
        all.add(buildMasteryKing(3, modulesAtMastery, masteryRequired, totalCatalogModules));
        all.add(buildColabAnalyst(4, hasExportMilestone));
        all.sort(Comparator.comparingInt(AchievementItemDto::sortOrder));

        List<AchievementItemDto> recent = all.stream()
                .filter(AchievementItemDto::earned)
                .sorted(Comparator.comparingInt(AchievementItemDto::sortOrder))
                .limit(3)
                .toList();

        return new GamificationSummaryDto(streakDays, streakActive, dailyGoal, recent, all);
    }

    /**
     * Streak ends at the last active day: if today has no activity but yesterday does, count from yesterday (UTC).
     */
    static int computeStreakDays(Set<LocalDate> active, LocalDate today) {
        if (active.isEmpty()) {
            return 0;
        }
        LocalDate end;
        if (active.contains(today)) {
            end = today;
        } else if (active.contains(today.minusDays(1))) {
            end = today.minusDays(1);
        } else {
            return 0;
        }
        int n = 0;
        LocalDate d = end;
        while (active.contains(d)) {
            n++;
            d = d.minusDays(1);
        }
        return n;
    }

    private static AchievementItemDto buildFirstSteps(int order, long totalAttempts) {
        boolean earned = totalAttempts >= 1;
        String progress = earned ? null : "0 / 1 practice attempts";
        return new AchievementItemDto(
                "first-steps",
                "First Steps",
                "Complete your first interactive practice attempt.",
                "🎯",
                earned,
                progress,
                order
        );
    }

    private static AchievementItemDto buildWeekWarrior(int order, int streakDays) {
        boolean earned = streakDays >= 7;
        String progress = earned ? null : streakDays + " / 7 day streak";
        return new AchievementItemDto(
                "week-warrior",
                "Week Warrior",
                "Maintain a 7-day learning streak.",
                "⚔️",
                earned,
                progress,
                order
        );
    }

    private static AchievementItemDto buildMasteryKing(int order, int masteredModules, int required, int catalogTotal) {
        boolean earned = masteredModules >= required;
        String progress = earned
                ? null
                : masteredModules + " / " + required + " modules at "
                        + LearningProgressService.MODULE_COMPLETE_THRESHOLD_PERCENT + "% (catalog " + catalogTotal + " modules)";
        return new AchievementItemDto(
                "mastery-king",
                "Mastery King",
                "Reach adjusted Bayesian mastery on multiple catalog modules.",
                "👑",
                earned,
                progress,
                order
        );
    }

    private static AchievementItemDto buildColabAnalyst(int order, boolean exportDone) {
        boolean earned = exportDone;
        String progress = earned ? null : "Download CSV or Colab starter from your dashboard analytics";
        return new AchievementItemDto(
                "colab-analyst",
                "Colab Analyst",
                "Export your learning analytics (CSV or Colab starter notebook).",
                "📓",
                earned,
                progress,
                order
        );
    }
}
