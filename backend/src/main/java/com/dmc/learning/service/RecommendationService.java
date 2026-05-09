package com.dmc.learning.service;

import com.dmc.common.exception.ApiException;
import com.dmc.gamification.config.GamificationProperties;
import com.dmc.gamification.service.GamificationService;
import com.dmc.learning.config.ModuleDependencyGraph;
import com.dmc.learning.config.ModuleDependencyGraph.CatalogModule;
import com.dmc.learning.dto.ModuleRecommendationDto;
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

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RecommendationService {

    private static final double PREREQ_READY_THRESHOLD = 0.40;
    private static final double PREREQ_PRIME_LOW = 0.70;
    private static final double PREREQ_PRIME_HIGH = 0.90;
    private static final int TARGET_MASTERED_PERCENT = 92;
    private static final int BURST_WINDOW_HOURS = 2;
    private static final int BURST_ATTEMPT_SOFT_CAP = 5;
    private static final int STALE_DAYS_FOR_REVISIT = 7;
    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final StudentSkillRepository studentSkillRepository;
    private final UserRepository userRepository;
    private final GamificationService gamificationService;
    private final GamificationProperties gamificationProperties;
    private final ProblemAttemptRepository problemAttemptRepository;
    private final GeneratedProblemAttemptRepository generatedProblemAttemptRepository;

    public List<ModuleRecommendationDto> recommendModules(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        Map<String, StudentSkill> skillByTopic = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .collect(Collectors.toMap(StudentSkill::getTopicSlug, s -> s, (a, b) -> a, HashMap::new));

        int streakDays = gamificationService.streakDaysForUser(userId);
        int masteryRequired = Math.max(1, gamificationProperties.masteryKingModulesRequired());
        int modulesAtMastery = countModulesAtOrAboveMastery(skillByTopic);
        long recentAttempts = countRecentAttempts(user, BURST_WINDOW_HOURS);
        boolean burstFatigue = recentAttempts > BURST_ATTEMPT_SOFT_CAP;

        List<ScoredModule> scored = new ArrayList<>();
        for (CatalogModule m : ModuleDependencyGraph.modules()) {
            int targetPct = adjustedMasteryPercent(skillByTopic, m.skillTopicSlug());
            PrereqSnapshot prereqs = summarizePrereqs(skillByTopic, m.prerequisiteSkillSlugs());

            if (targetPct >= TARGET_MASTERED_PERCENT) {
                continue;
            }
            if (!prereqs.ready()) {
                continue;
            }

            double score = 100.0 - targetPct;
            double maxPrereqAdj = prereqs.maxPrerequisiteAdjustedPknow();
            if (maxPrereqAdj >= PREREQ_PRIME_LOW && maxPrereqAdj <= PREREQ_PRIME_HIGH) {
                score += 30;
            }
            if (daysSinceLastSkillTouch(skillByTopic, m.skillTopicSlug()) >= STALE_DAYS_FOR_REVISIT) {
                score += 15;
            }
            if (burstFatigue && recentAttemptsOnTopic(skillByTopic, m.skillTopicSlug(), user, BURST_WINDOW_HOURS) >= 3) {
                score -= 25;
            }

            String reason = buildReason(
                    m,
                    targetPct,
                    skillByTopic,
                    streakDays,
                    modulesAtMastery,
                    masteryRequired,
                    burstFatigue,
                    prereqs
            );

            scored.add(new ScoredModule(
                    new ModuleRecommendationDto(
                            m.moduleSlug(),
                            m.displayName(),
                            m.subjectSlug(),
                            reason,
                            m.estimatedMinutes(),
                            m.difficultyLevel(),
                            prereqs.ready(),
                            score
                    ),
                    score
            ));
        }

        if (scored.isEmpty()) {
            return fallbackRecommendations(skillByTopic, streakDays);
        }

        return scored.stream()
                .sorted(Comparator.comparingDouble(ScoredModule::score).reversed())
                .limit(3)
                .map(ScoredModule::dto)
                .toList();
    }

    private long countRecentAttempts(User user, int hours) {
        OffsetDateTime since = OffsetDateTime.now(UTC).minusHours(hours);
        return problemAttemptRepository.countByUserAndCreatedAtAfter(user, since)
                + generatedProblemAttemptRepository.countByUserAndCreatedAtAfter(user, since);
    }

    private long recentAttemptsOnTopic(
            Map<String, StudentSkill> skillByTopic,
            String topicSlug,
            User user,
            int hours
    ) {
        OffsetDateTime since = OffsetDateTime.now(UTC).minusHours(hours);
        long n = 0;
        for (ProblemAttempt a : problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(user, since)) {
            if (topicSlug != null && topicSlug.equals(a.getTopicSlug())) {
                n++;
            }
        }
        for (GeneratedProblemAttempt a : generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(user, since)) {
            if (topicSlug != null && topicSlug.equals(a.getTopicSlug())) {
                n++;
            }
        }
        return n;
    }

    private int countModulesAtOrAboveMastery(Map<String, StudentSkill> skillByTopic) {
        int c = 0;
        for (CatalogModule m : ModuleDependencyGraph.modules()) {
            if (adjustedMasteryPercent(skillByTopic, m.skillTopicSlug()) >= LearningProgressService.MODULE_COMPLETE_THRESHOLD_PERCENT) {
                c++;
            }
        }
        return c;
    }

    private long daysSinceLastSkillTouch(Map<String, StudentSkill> skillByTopic, String topicSlug) {
        StudentSkill s = skillByTopic.get(topicSlug);
        if (s == null || s.getUpdatedAt() == null) {
            return 999;
        }
        return ChronoUnit.DAYS.between(s.getUpdatedAt().atZoneSameInstant(UTC).toLocalDate(), OffsetDateTime.now(UTC).atZoneSameInstant(UTC).toLocalDate());
    }

    private List<ModuleRecommendationDto> fallbackRecommendations(Map<String, StudentSkill> skillByTopic, int streakDays) {
        String streakHint = streakDays >= 3
                ? String.format(" You're on a **%d-day** streak — keep the rhythm with short calculator sessions.", streakDays)
                : "";
        return ModuleDependencyGraph.modules().stream()
                .filter(m -> adjustedMasteryPercent(skillByTopic, m.skillTopicSlug()) < TARGET_MASTERED_PERCENT)
                .sorted(Comparator.comparingInt(CatalogModule::estimatedMinutes))
                .limit(3)
                .map(m -> new ModuleRecommendationDto(
                        m.moduleSlug(),
                        m.displayName(),
                        m.subjectSlug(),
                        "Great starting point — open the interactive calculator and work a few guided examples." + streakHint,
                        m.estimatedMinutes(),
                        m.difficultyLevel(),
                        true,
                        50.0
                ))
                .toList();
    }

    private PrereqSnapshot summarizePrereqs(Map<String, StudentSkill> skillByTopic, List<String> prereqSlugs) {
        if (prereqSlugs == null || prereqSlugs.isEmpty()) {
            return new PrereqSnapshot(true, 1.0, List.of());
        }
        double minPknowAdj = 1.0;
        double maxPknowAdj = 0.0;
        List<String> labels = new ArrayList<>();
        for (String slug : prereqSlugs) {
            double adj = BktMasteryMath.adjustedPknow(skillByTopic, slug);
            minPknowAdj = Math.min(minPknowAdj, adj);
            maxPknowAdj = Math.max(maxPknowAdj, adj);
            labels.add(humanLabel(slug));
        }
        boolean ready = minPknowAdj >= PREREQ_READY_THRESHOLD;
        return new PrereqSnapshot(ready, maxPknowAdj, labels);
    }

    private String buildReason(
            CatalogModule module,
            int targetPct,
            Map<String, StudentSkill> skillByTopic,
            int streakDays,
            int modulesAtMastery,
            int masteryRequired,
            boolean burstFatigue,
            PrereqSnapshot prereqs
    ) {
        String band = masteryBandLabel(targetPct);
        StringBuilder sb = new StringBuilder();
        sb.append(String.format(
                "**%s** — adjusted mastery about **%d%%** (%s). ",
                module.displayName(),
                targetPct,
                band
        ));

        if (streakDays >= 3) {
            sb.append(String.format("You're on a **%d-day** learning streak (UTC) — great momentum. ", streakDays));
        }

        if (modulesAtMastery < masteryRequired) {
            sb.append(String.format(
                    "Toward the **Mastery King** badge: **%d / %d** catalog modules at ≥%d%%. ",
                    modulesAtMastery,
                    masteryRequired,
                    LearningProgressService.MODULE_COMPLETE_THRESHOLD_PERCENT
            ));
        }

        long stale = daysSinceLastSkillTouch(skillByTopic, module.skillTopicSlug());
        if (stale >= STALE_DAYS_FOR_REVISIT && stale < 900) {
            sb.append(String.format("It's been **%d** days since this topic moved — good time to revisit. ", stale));
        }

        if (burstFatigue) {
            sb.append("_Tip: many attempts in the last 2h — consider a short break or a gentler module._ ");
        }

        List<String> prereqSlugs = module.prerequisiteSkillSlugs();
        if (prereqSlugs.isEmpty()) {
            sb.append("No hard prerequisites — ideal for **focused practice** next.");
            return sb.toString();
        }

        String topPrereq = prereqSlugs.get(0);
        int prereqPct = adjustedMasteryPercent(skillByTopic, topPrereq);
        String joined = String.join(", ", prereqs.prereqLabels());
        sb.append(String.format(
                "Prerequisites (**%s**) look ready (top ~**%d%%** adjusted). Typical session ~**%d** min.",
                joined,
                prereqPct,
                module.estimatedMinutes()
        ));

        return sb.toString();
    }

    private static String masteryBandLabel(int pct) {
        if (pct < 20) {
            return "foundation building";
        }
        if (pct < 50) {
            return "consolidation zone";
        }
        if (pct < 80) {
            return "stretch growth";
        }
        return "near mastery";
    }

    private static String humanLabel(String slug) {
        return slug.replace('_', ' ');
    }

    private int adjustedMasteryPercent(Map<String, StudentSkill> skillByTopic, String topicSlug) {
        return BktMasteryMath.adjustedMasteryPercent(skillByTopic, topicSlug);
    }

    private record PrereqSnapshot(boolean ready, double maxPrerequisiteAdjustedPknow, List<String> prereqLabels) {
    }

    private record ScoredModule(ModuleRecommendationDto dto, double score) {
    }
}
