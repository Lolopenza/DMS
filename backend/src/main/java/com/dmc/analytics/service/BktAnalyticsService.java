package com.dmc.analytics.service;

import com.dmc.analytics.dto.BktAnalyticsSummaryResponse;
import com.dmc.analytics.dto.RawLearningAnalyticsDatasetResponse;
import com.dmc.infrastructure.mathengine.MathEngineProperties;
import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.ProblemAttemptRepository;
import com.dmc.problem.repository.GeneratedProblemAttemptRepository;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import com.dmc.user.entity.UserRole;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import com.dmc.common.exception.ApiException;

import java.time.OffsetDateTime;
import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.DoubleSummaryStatistics;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class BktAnalyticsService {

    private final UserRepository userRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final ProblemAttemptRepository problemAttemptRepository;
    private final GeneratedProblemAttemptRepository generatedProblemAttemptRepository;
    private final MathEngineProperties mathEngineProperties;

    public void assertInternalKey(String inboundKey) {
        String configured = mathEngineProperties.getApiKey();
        if (configured != null && !configured.isBlank() && !configured.equals("change-me")) {
            if (inboundKey == null || !inboundKey.equals(configured)) {
                throw new ApiException(HttpStatus.UNAUTHORIZED, "INTERNAL_API_KEY_INVALID", "Invalid internal API key");
            }
        }
    }

    public BktAnalyticsSummaryResponse summaryForUser(Long userId, int windowDays) {
        if (windowDays <= 0 || windowDays > 365) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WINDOW", "windowDays must be between 1 and 365");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        OffsetDateTime windowEnd = OffsetDateTime.now();
        OffsetDateTime windowStart = windowEnd.minusDays(windowDays);

        List<StudentSkill> skills = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user);
        List<BktAnalyticsSummaryResponse.SkillSummaryItem> skillItems = skills.stream()
                .sorted(Comparator.comparing(StudentSkill::getTopicSlug, Comparator.nullsLast(String::compareTo)))
                .map(s -> new BktAnalyticsSummaryResponse.SkillSummaryItem(
                        s.getTopicSlug(),
                        s.getPKnow(),
                        masteryLabel(s.getPKnow()),
                        s.getTotalAttempts(),
                        s.getCorrectAttempts(),
                        s.getUpdatedAt()
                ))
                .toList();

        List<AttemptRow> attempts = mergedAttempts(user, windowStart);
        int total = attempts.size();
        int correct = (int) attempts.stream().filter(AttemptRow::correct).count();
        int incorrect = total - correct;
        Map<String, Integer> methodCounts = attempts.stream()
                .map(a -> a.verificationMethod() == null ? "unknown" : a.verificationMethod())
                .collect(Collectors.toMap(m -> m, m -> 1, Integer::sum));
        List<Integer> timeValues = attempts.stream()
                .map(AttemptRow::timeSpentSeconds)
                .filter(v -> v != null && v >= 0)
                .sorted()
                .toList();
        double avgTime = timeValues.isEmpty() ? 0.0 : timeValues.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        double p50Time = percentile(timeValues, 0.50);
        double p90Time = percentile(timeValues, 0.90);

        BktAnalyticsSummaryResponse.AttemptAggregates aggregates = new BktAnalyticsSummaryResponse.AttemptAggregates(
                total,
                correct,
                incorrect,
                avgTime,
                p50Time,
                p90Time,
                methodCounts
        );

        Map<String, List<AttemptRow>> attemptsByTopic = attempts.stream()
                .collect(Collectors.groupingBy(a -> a.topicSlug() == null || a.topicSlug().isBlank() ? "unknown" : a.topicSlug()));

        List<BktAnalyticsSummaryResponse.TopicKpiItem> topicKpis = attemptsByTopic.entrySet().stream()
                .map(entry -> toTopicKpi(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(BktAnalyticsSummaryResponse.TopicKpiItem::topicSlug))
                .toList();

        Map<String, Integer> errorBreakdown = attempts.stream()
                .map(a -> a.errorType() == null || a.errorType().isBlank() ? "NONE" : a.errorType())
                .collect(Collectors.toMap(e -> e, e -> 1, Integer::sum));

        List<BktAnalyticsSummaryResponse.DailyAccuracyPoint> dailyAccuracy = attempts.stream()
                .collect(Collectors.groupingBy(a -> a.createdAt().toLocalDate()))
                .entrySet()
                .stream()
                .map(entry -> {
                    int dayTotal = entry.getValue().size();
                    int dayCorrect = (int) entry.getValue().stream().filter(AttemptRow::correct).count();
                    double accuracy = dayTotal == 0 ? 0.0 : (double) dayCorrect / dayTotal;
                    return new BktAnalyticsSummaryResponse.DailyAccuracyPoint(entry.getKey(), dayTotal, dayCorrect, accuracy);
                })
                .sorted(Comparator.comparing(BktAnalyticsSummaryResponse.DailyAccuracyPoint::day))
                .toList();

        BktAnalyticsSummaryResponse.StabilityFlags stabilityFlags = buildStabilityFlags(dailyAccuracy);

        return new BktAnalyticsSummaryResponse(
                user.getId(),
                windowDays,
                windowStart,
                windowEnd,
                skillItems,
                aggregates,
                topicKpis,
                dailyAccuracy,
                errorBreakdown,
                stabilityFlags
        );
    }

    public RawLearningAnalyticsDatasetResponse rawDatasetForUser(Long userId, int windowDays) {
        if (windowDays <= 0 || windowDays > 365) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WINDOW", "windowDays must be between 1 and 365");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        OffsetDateTime windowEnd = OffsetDateTime.now();
        OffsetDateTime windowStart = windowEnd.minusDays(windowDays);
        List<AttemptRow> rows = mergedAttempts(user, windowStart);
        QualityCounters counters = new QualityCounters();
        Map<String, AtomicInteger> topicAttemptIndexes = new HashMap<>();
        Map<String, AtomicInteger> retryIndexes = new HashMap<>();
        List<RawLearningAnalyticsDatasetResponse.AttemptRow> payloadRows = rows.stream()
                .sorted(Comparator.comparing(AttemptRow::createdAt))
                .map(a -> toRawRow(a, counters, topicAttemptIndexes, retryIndexes))
                .toList();
        Map<String, Object> metadata = new HashMap<>();
        metadata.put("records", payloadRows.size());
        metadata.put("schemaVersion", 2);
        metadata.put("includesTopicPath", true);
        metadata.put("invalidTimeCount", counters.invalidTimeCount);
        metadata.put("missingErrorTypeCount", counters.missingErrorTypeCount);
        metadata.put("repairedRows", counters.repairedRows);
        return new RawLearningAnalyticsDatasetResponse(user.getId(), windowDays, windowStart, windowEnd, payloadRows, metadata);
    }

    public String rawDatasetCsvForUser(Long userId, int windowDays) {
        RawLearningAnalyticsDatasetResponse dataset = rawDatasetForUser(userId, windowDays);
        StringBuilder sb = new StringBuilder();
        sb.append("source,topicSlug,topicPath,difficultyAtAttempt,difficultyScore,correct,timeSpentSeconds,timeToFirstActionSeconds,hintUsed,errorType,attemptIndexWithinTopic,retryCountForProblem,hourOfDay,dayOfWeek,isLateNight,createdAt\n");
        for (RawLearningAnalyticsDatasetResponse.AttemptRow row : dataset.attempts()) {
            sb.append(csv(row.source())).append(',')
                    .append(csv(row.topicSlug())).append(',')
                    .append(csv(row.topicPath())).append(',')
                    .append(csv(row.difficultyAtAttempt())).append(',')
                    .append(csv(row.difficultyScore())).append(',')
                    .append(csv(row.correct())).append(',')
                    .append(csv(row.timeSpentSeconds())).append(',')
                    .append(csv(row.timeToFirstActionSeconds())).append(',')
                    .append(csv(row.hintUsed())).append(',')
                    .append(csv(row.errorType())).append(',')
                    .append(csv(row.attemptIndexWithinTopic())).append(',')
                    .append(csv(row.retryCountForProblem())).append(',')
                    .append(csv(row.hourOfDay())).append(',')
                    .append(csv(row.dayOfWeek())).append(',')
                    .append(csv(row.lateNight())).append(',')
                    .append(csv(row.createdAt()))
                    .append('\n');
        }
        return sb.toString();
    }

    public String rawDatasetCsvForStudentsAnonymized(int windowDays) {
        if (windowDays <= 0 || windowDays > 365) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WINDOW", "windowDays must be between 1 and 365");
        }
        List<User> students = userRepository.findByRoleOrderByIdAsc(UserRole.STUDENT);
        StringBuilder sb = new StringBuilder();
        sb.append("anonUserId,source,topicSlug,topicPath,difficultyAtAttempt,difficultyScore,correct,timeSpentSeconds,timeToFirstActionSeconds,hintUsed,errorType,attemptIndexWithinTopic,retryCountForProblem,hourOfDay,dayOfWeek,isLateNight,createdAt\n");
        int anonIdx = 1;
        for (User student : students) {
            RawLearningAnalyticsDatasetResponse ds = rawDatasetForUser(student.getId(), windowDays);
            String anon = "student_" + anonIdx++;
            for (RawLearningAnalyticsDatasetResponse.AttemptRow row : ds.attempts()) {
                sb.append(csv(anon)).append(',')
                        .append(csv(row.source())).append(',')
                        .append(csv(row.topicSlug())).append(',')
                        .append(csv(row.topicPath())).append(',')
                        .append(csv(row.difficultyAtAttempt())).append(',')
                        .append(csv(row.difficultyScore())).append(',')
                        .append(csv(row.correct())).append(',')
                        .append(csv(row.timeSpentSeconds())).append(',')
                        .append(csv(row.timeToFirstActionSeconds())).append(',')
                        .append(csv(row.hintUsed())).append(',')
                        .append(csv(row.errorType())).append(',')
                        .append(csv(row.attemptIndexWithinTopic())).append(',')
                        .append(csv(row.retryCountForProblem())).append(',')
                        .append(csv(row.hourOfDay())).append(',')
                        .append(csv(row.dayOfWeek())).append(',')
                        .append(csv(row.lateNight())).append(',')
                        .append(csv(row.createdAt()))
                        .append('\n');
            }
        }
        return sb.toString();
    }

    private List<AttemptRow> mergedAttempts(User user, OffsetDateTime windowStart) {
        List<AttemptRow> rows = new ArrayList<>();
        List<ProblemAttempt> standard = problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(user, windowStart);
        for (ProblemAttempt a : standard) {
            rows.add(new AttemptRow(
                    "problem",
                    blankToNull(a.getTopicSlug()),
                    blankToNull(a.getTopicPath()),
                    a.getDifficultyAtAttempt() == null ? null : a.getDifficultyAtAttempt().name(),
                    Boolean.TRUE.equals(a.getCorrect()),
                    a.getTimeSpentSeconds(),
                    a.getTimeToFirstActionSeconds(),
                    Boolean.TRUE.equals(a.getHintUsed()),
                    a.getErrorType() == null ? null : a.getErrorType().name(),
                    "direct",
                    "problem:" + (a.getProblem() == null ? "unknown" : a.getProblem().getId()),
                    a.getCreatedAt()
            ));
        }
        List<GeneratedProblemAttempt> generated = generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(user, windowStart);
        for (GeneratedProblemAttempt a : generated) {
            rows.add(new AttemptRow(
                    "generated",
                    blankToNull(a.getTopicSlug()),
                    blankToNull(a.getTopicPath()),
                    a.getDifficultyAtAttempt() == null ? null : a.getDifficultyAtAttempt().name(),
                    Boolean.TRUE.equals(a.getCorrect()),
                    a.getTimeSpentSeconds(),
                    a.getTimeToFirstActionSeconds(),
                    Boolean.TRUE.equals(a.getHintUsed()),
                    a.getErrorType() == null ? null : a.getErrorType().name(),
                    a.getVerificationMethod(),
                    "generated:" + (a.getGeneratedProblem() == null ? "unknown" : a.getGeneratedProblem().getId()),
                    a.getCreatedAt()
            ));
        }
        return rows;
    }

    private BktAnalyticsSummaryResponse.TopicKpiItem toTopicKpi(String topicSlug, List<AttemptRow> attempts) {
        int total = attempts.size();
        int correct = (int) attempts.stream().filter(AttemptRow::correct).count();
        double successRate = total == 0 ? 0.0 : (double) correct / total;
        List<Integer> times = attempts.stream()
                .map(AttemptRow::timeSpentSeconds)
                .filter(v -> v != null && v >= 0)
                .sorted()
                .toList();
        double avg = times.isEmpty() ? 0.0 : times.stream().mapToInt(Integer::intValue).average().orElse(0.0);
        return new BktAnalyticsSummaryResponse.TopicKpiItem(
                topicSlug,
                total,
                correct,
                successRate,
                avg,
                percentile(times, 0.50),
                percentile(times, 0.90)
        );
    }

    private BktAnalyticsSummaryResponse.StabilityFlags buildStabilityFlags(List<BktAnalyticsSummaryResponse.DailyAccuracyPoint> dailyAccuracy) {
        if (dailyAccuracy.isEmpty()) {
            return new BktAnalyticsSummaryResponse.StabilityFlags(true, "insufficient_data");
        }
        DoubleSummaryStatistics stats = dailyAccuracy.stream().collect(Collectors.summarizingDouble(BktAnalyticsSummaryResponse.DailyAccuracyPoint::accuracy));
        boolean stable = (stats.getMax() - stats.getMin()) <= 0.25;
        String trend = "stable";
        if (dailyAccuracy.size() >= 2) {
            double first = dailyAccuracy.get(0).accuracy();
            double last = dailyAccuracy.get(dailyAccuracy.size() - 1).accuracy();
            if (last - first > 0.10) {
                trend = "improving";
            } else if (first - last > 0.10) {
                trend = "declining";
            }
        }
        return new BktAnalyticsSummaryResponse.StabilityFlags(stable, trend);
    }

    private double percentile(List<Integer> sortedValues, double p) {
        if (sortedValues.isEmpty()) {
            return 0.0;
        }
        int idx = (int) Math.ceil(p * sortedValues.size()) - 1;
        idx = Math.max(0, Math.min(sortedValues.size() - 1, idx));
        return sortedValues.get(idx);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value;
    }

    private RawLearningAnalyticsDatasetResponse.AttemptRow toRawRow(
            AttemptRow row,
            QualityCounters counters,
            Map<String, AtomicInteger> topicAttemptIndexes,
            Map<String, AtomicInteger> retryIndexes
    ) {
        Integer spent = sanitizeSeconds(row.timeSpentSeconds());
        Integer firstAction = sanitizeSeconds(row.timeToFirstActionSeconds());
        boolean repaired = false;
        if (firstAction != null && spent != null && firstAction > spent) {
            firstAction = spent;
            repaired = true;
            counters.invalidTimeCount++;
        }
        if (row.timeSpentSeconds() != null && spent != null && !row.timeSpentSeconds().equals(spent)) {
            counters.invalidTimeCount++;
            repaired = true;
        }
        if (row.timeToFirstActionSeconds() != null && firstAction != null && !row.timeToFirstActionSeconds().equals(firstAction)) {
            counters.invalidTimeCount++;
            repaired = true;
        }
        String errorType = (row.errorType() == null || row.errorType().isBlank()) ? "NONE" : row.errorType();
        if ("NONE".equals(errorType)) {
            counters.missingErrorTypeCount++;
        }
        if (repaired) {
            counters.repairedRows++;
        }
        String topicKey = row.topicSlug() == null ? "unknown" : row.topicSlug();
        int topicAttemptIndex = topicAttemptIndexes.computeIfAbsent(topicKey, k -> new AtomicInteger(0)).incrementAndGet();
        int retryIndex = retryIndexes.computeIfAbsent(row.source() + ":" + row.problemKey(), k -> new AtomicInteger(0)).incrementAndGet() - 1;
        int hour = row.createdAt().atZoneSameInstant(ZoneOffset.UTC).getHour();
        int dayOfWeek = row.createdAt().atZoneSameInstant(ZoneOffset.UTC).getDayOfWeek().getValue();
        return new RawLearningAnalyticsDatasetResponse.AttemptRow(
                row.source(),
                row.topicSlug(),
                row.topicPath(),
                row.difficultyAtAttempt(),
                difficultyScore(row.difficultyAtAttempt()),
                row.correct(),
                spent,
                firstAction,
                row.hintUsed(),
                errorType,
                topicAttemptIndex,
                retryIndex,
                hour,
                dayOfWeek,
                hour >= 23 || hour < 6,
                row.createdAt()
        );
    }

    private Integer sanitizeSeconds(Integer value) {
        if (value == null) {
            return null;
        }
        if (value < 0) {
            return 0;
        }
        return Math.min(value, 4 * 60 * 60);
    }

    private Double difficultyScore(String difficulty) {
        if (difficulty == null) {
            return null;
        }
        return switch (difficulty) {
            case "EASY" -> 0.35;
            case "MEDIUM" -> 0.60;
            case "HARD" -> 0.85;
            default -> 0.60;
        };
    }

    private String csv(Object value) {
        String text = value == null ? "" : String.valueOf(value);
        return "\"" + text.replace("\"", "\"\"") + "\"";
    }

    private static class QualityCounters {
        int invalidTimeCount;
        int missingErrorTypeCount;
        int repairedRows;
    }

    private record AttemptRow(
            String source,
            String topicSlug,
            String topicPath,
            String difficultyAtAttempt,
            boolean correct,
            Integer timeSpentSeconds,
            Integer timeToFirstActionSeconds,
            boolean hintUsed,
            String errorType,
            String verificationMethod,
            String problemKey,
            OffsetDateTime createdAt
    ) {}

    private String masteryLabel(double pKnow) {
        if (pKnow < 0.3) return "NOVICE";
        if (pKnow < 0.5) return "BEGINNER";
        if (pKnow < 0.7) return "INTERMEDIATE";
        if (pKnow < 0.9) return "ADVANCED";
        return "MASTERED";
    }
}

