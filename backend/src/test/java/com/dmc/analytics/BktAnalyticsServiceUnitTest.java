package com.dmc.analytics;

import com.dmc.analytics.dto.BktAnalyticsSummaryResponse;
import com.dmc.analytics.dto.RawLearningAnalyticsDatasetResponse;
import com.dmc.analytics.service.BktAnalyticsService;
import com.dmc.common.exception.ApiException;
import com.dmc.infrastructure.mathengine.MathEngineProperties;
import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.GeneratedProblem;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import com.dmc.problem.entity.Problem;
import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.GeneratedProblemAttemptRepository;
import com.dmc.problem.repository.ProblemAttemptRepository;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BktAnalyticsServiceUnitTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private StudentSkillRepository studentSkillRepository;
    @Mock
    private ProblemAttemptRepository problemAttemptRepository;
    @Mock
    private GeneratedProblemAttemptRepository generatedProblemAttemptRepository;
    @Mock
    private MathEngineProperties mathEngineProperties;
    @InjectMocks
    private BktAnalyticsService service;
    private User user;

    @BeforeEach
    void setUp() {
        user = User.builder()
                .id(11L)
                .email("student@example.com")
                .username("student")
                .password("pwd")
                .build();
    }

    @Test
    void should_repair_invalid_time_fields_and_keep_extended_attempt_metadata() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        OffsetDateTime now = OffsetDateTime.now();
        Problem problem = new Problem();
        problem.setId(101L);

        ProblemAttempt p1 = ProblemAttempt.builder()
                .user(user)
                .problem(problem)
                .correct(false)
                .timeSpentSeconds(-5)
                .timeToFirstActionSeconds(10)
                .hintUsed(false)
                .errorType(null)
                .difficultyAtAttempt(Difficulty.MEDIUM)
                .topicSlug("combinatorics")
                .topicPath("math.combinatorics")
                .createdAt(now.minusMinutes(2))
                .build();

        ProblemAttempt p2 = ProblemAttempt.builder()
                .user(user)
                .problem(problem)
                .correct(true)
                .timeSpentSeconds(40)
                .timeToFirstActionSeconds(50)
                .hintUsed(true)
                .errorType(null)
                .difficultyAtAttempt(Difficulty.HARD)
                .topicSlug("combinatorics")
                .topicPath("math.combinatorics")
                .createdAt(now.minusMinutes(1))
                .build();

        GeneratedProblem gp = new GeneratedProblem();
        gp.setId(202L);
        GeneratedProblemAttempt g1 = GeneratedProblemAttempt.builder()
                .user(user)
                .generatedProblem(gp)
                .correct(false)
                .verificationMethod("llm")
                .timeSpentSeconds(15)
                .timeToFirstActionSeconds(4)
                .hintUsed(false)
                .errorType(null)
                .difficultyAtAttempt(Difficulty.EASY)
                .topicSlug("logic")
                .topicPath("math.logic")
                .createdAt(now)
                .build();

        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(p2, p1));
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(g1));

        RawLearningAnalyticsDatasetResponse ds = service.rawDatasetForUser(11L, 30);

        assertThat(ds.attempts()).hasSize(3);
        RawLearningAnalyticsDatasetResponse.AttemptRow first = ds.attempts().get(0);
        RawLearningAnalyticsDatasetResponse.AttemptRow second = ds.attempts().get(1);
        assertThat(first.timeSpentSeconds()).isEqualTo(0);
        assertThat(first.timeToFirstActionSeconds()).isEqualTo(0);
        assertThat(first.errorType()).isEqualTo("NONE");
        assertThat(first.attemptIndexWithinTopic()).isEqualTo(1);
        assertThat(second.retryCountForProblem()).isEqualTo(1);
        assertThat(ds.metadata())
                .containsEntry("schemaVersion", 2)
                .containsEntry("records", 3)
                .containsEntry("includesTopicPath", true)
                .containsEntry("missingErrorTypeCount", 3);
        assertThat((Integer) ds.metadata().get("invalidTimeCount")).isGreaterThanOrEqualTo(4);
        assertThat((Integer) ds.metadata().get("repairedRows")).isEqualTo(2);
    }

    @Test
    void should_build_stable_aggregates_and_percentiles_for_mixed_attempts() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));
        StudentSkill skill = StudentSkill.builder()
                .user(user)
                .topicSlug("logic")
                .pKnow(0.72)
                .totalAttempts(10)
                .correctAttempts(7)
                .build();
        skill.setUpdatedAt(OffsetDateTime.now().minusDays(1));
        when(studentSkillRepository.findByUserOrderByUpdatedAtDesc(user)).thenReturn(List.of(skill));

        OffsetDateTime now = OffsetDateTime.now();
        Problem problem = new Problem();
        problem.setId(301L);
        ProblemAttempt p = ProblemAttempt.builder()
                .user(user)
                .problem(problem)
                .correct(true)
                .timeSpentSeconds(20)
                .timeToFirstActionSeconds(3)
                .hintUsed(false)
                .errorType(null)
                .difficultyAtAttempt(Difficulty.MEDIUM)
                .topicSlug("logic")
                .topicPath("math.logic")
                .createdAt(now.minusHours(1))
                .build();

        GeneratedProblem gp = new GeneratedProblem();
        gp.setId(302L);
        GeneratedProblemAttempt g = GeneratedProblemAttempt.builder()
                .user(user)
                .generatedProblem(gp)
                .correct(false)
                .verificationMethod("llm")
                .timeSpentSeconds(50)
                .timeToFirstActionSeconds(10)
                .hintUsed(true)
                .errorType(com.dmc.problem.entity.ErrorType.OTHER)
                .difficultyAtAttempt(Difficulty.HARD)
                .topicSlug("logic")
                .topicPath("math.logic")
                .createdAt(now.minusMinutes(20))
                .build();

        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(p));
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(g));

        BktAnalyticsSummaryResponse summary = service.summaryForUser(11L, 30);

        assertThat(summary.skills()).hasSize(1);
        assertThat(summary.attemptAggregates().generatedAttemptsTotal()).isEqualTo(2);
        assertThat(summary.attemptAggregates().generatedAttemptsCorrect()).isEqualTo(1);
        assertThat(summary.attemptAggregates().generatedAttemptsIncorrect()).isEqualTo(1);
        assertThat(summary.attemptAggregates().avgTimeSpentSeconds()).isEqualTo(35.0);
        assertThat(summary.attemptAggregates().verificationMethodCounts()).containsEntry("direct", 1).containsEntry("llm", 1);
        assertThat(summary.topicKpis()).hasSize(1);
        assertThat(summary.topicKpis().getFirst().successRate()).isEqualTo(0.5);
        assertThat(summary.errorTypeBreakdown()).containsEntry("NONE", 1).containsEntry("OTHER", 1);
        assertThat(summary.stabilityFlags().speedVsAccuracyTrend()).isEqualTo("stable");
    }

    @Test
    void should_reject_invalid_window_days_for_summary_endpoint() {
        assertThatThrownBy(() -> service.summaryForUser(11L, 0))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("windowDays must be between 1 and 365");
        assertThatThrownBy(() -> service.summaryForUser(11L, 366))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void should_reject_wrong_internal_key_when_key_is_configured() {
        when(mathEngineProperties.getApiKey()).thenReturn("secret-key");

        assertThatThrownBy(() -> service.assertInternalKey("wrong"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid internal API key");
        service.assertInternalKey("secret-key");
    }

    @Test
    void should_allow_missing_internal_key_when_default_change_me_is_used() {
        when(mathEngineProperties.getApiKey()).thenReturn("change-me");

        service.assertInternalKey(null);
        service.assertInternalKey("any-value");
    }

    @Test
    void should_return_zero_percentiles_for_first_attempt_only() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        OffsetDateTime now = OffsetDateTime.now();
        ProblemAttempt firstAttempt = ProblemAttempt.builder()
                .user(user)
                .problem(problem(777L))
                .correct(false)
                .timeSpentSeconds(0)
                .timeToFirstActionSeconds(0)
                .hintUsed(true)
                .errorType(com.dmc.problem.entity.ErrorType.ARITHMETIC_ERROR)
                .difficultyAtAttempt(Difficulty.EASY)
                .topicSlug("logic")
                .topicPath("math.logic")
                .createdAt(now)
                .build();

        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(firstAttempt));
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of());

        BktAnalyticsSummaryResponse summary = service.summaryForUser(11L, 30);

        assertThat(summary.attemptAggregates().generatedAttemptsTotal()).isEqualTo(1);
        assertThat(summary.attemptAggregates().avgTimeSpentSeconds()).isEqualTo(0.0);
        assertThat(summary.attemptAggregates().p50TimeSpentSeconds()).isEqualTo(0.0);
        assertThat(summary.attemptAggregates().p90TimeSpentSeconds()).isEqualTo(0.0);
        assertThat(summary.stabilityFlags().speedVsAccuracyTrend()).isEqualTo("stable");
    }

    @Test
    void should_calculate_percentiles_for_speed_accuracy_signal_with_instant_answers() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        OffsetDateTime now = OffsetDateTime.now();
        List<ProblemAttempt> attempts = List.of(
                attempt(11L, 1L, true, 0, 0, now.minusMinutes(4)),
                attempt(11L, 2L, true, 10, 1, now.minusMinutes(3)),
                attempt(11L, 3L, false, 20, 2, now.minusMinutes(2)),
                attempt(11L, 4L, true, 40, 3, now.minusMinutes(1))
        );
        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(attempts);
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of());

        BktAnalyticsSummaryResponse summary = service.summaryForUser(11L, 30);

        assertThat(summary.attemptAggregates().p50TimeSpentSeconds()).isEqualTo(10.0);
        assertThat(summary.attemptAggregates().p90TimeSpentSeconds()).isEqualTo(40.0);
        assertThat(summary.attemptAggregates().avgTimeSpentSeconds()).isEqualTo(17.5);
    }

    @Test
    void should_group_blank_topic_and_unknown_verification_method_in_summary() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        OffsetDateTime now = OffsetDateTime.now();
        GeneratedProblemAttempt generated = GeneratedProblemAttempt.builder()
                .user(user)
                .generatedProblem(generatedProblem(808L))
                .correct(true)
                .verificationMethod(null)
                .timeSpentSeconds(12)
                .timeToFirstActionSeconds(2)
                .hintUsed(false)
                .errorType(null)
                .difficultyAtAttempt(Difficulty.MEDIUM)
                .topicSlug(" ")
                .topicPath("math.unknown")
                .createdAt(now)
                .build();
        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of());
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(generated));

        BktAnalyticsSummaryResponse summary = service.summaryForUser(11L, 30);

        assertThat(summary.attemptAggregates().verificationMethodCounts()).containsEntry("unknown", 1);
        assertThat(summary.topicKpis()).extracting(BktAnalyticsSummaryResponse.TopicKpiItem::topicSlug).contains("unknown");
    }

    @Test
    void should_clamp_outlier_times_to_four_hours_in_raw_dataset() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        ProblemAttempt attempt = attempt(11L, 991L, true, 20_000, 50_000, OffsetDateTime.now());
        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(attempt));
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of());

        RawLearningAnalyticsDatasetResponse ds = service.rawDatasetForUser(11L, 7);

        RawLearningAnalyticsDatasetResponse.AttemptRow row = ds.attempts().getFirst();
        assertThat(row.timeSpentSeconds()).isEqualTo(14_400);
        assertThat(row.timeToFirstActionSeconds()).isEqualTo(14_400);
    }

    @Test
    void should_escape_quotes_commas_and_newlines_when_exporting_csv() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));

        ProblemAttempt attempt = ProblemAttempt.builder()
                .user(user)
                .problem(problem(19L))
                .correct(true)
                .timeSpentSeconds(10)
                .timeToFirstActionSeconds(1)
                .hintUsed(false)
                .errorType(com.dmc.problem.entity.ErrorType.ARITHMETIC_ERROR)
                .difficultyAtAttempt(Difficulty.EASY)
                .topicSlug("logic,\"core\"\nline")
                .topicPath("math.logic")
                .createdAt(OffsetDateTime.now())
                .build();
        when(problemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of(attempt));
        when(generatedProblemAttemptRepository.findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(eq(user), any()))
                .thenReturn(List.of());

        String csv = service.rawDatasetCsvForUser(11L, 30);

        assertThat(csv).contains("\"logic,\"\"core\"\"\nline\"");
    }

    @Test
    void should_reject_invalid_window_for_raw_dataset_and_anonymized_export() {
        assertThatThrownBy(() -> service.rawDatasetForUser(11L, 0))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("windowDays must be between 1 and 365");
        assertThatThrownBy(() -> service.rawDatasetCsvForStudentsAnonymized(366))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("windowDays must be between 1 and 365");
    }

    private Problem problem(Long id) {
        Problem problem = new Problem();
        problem.setId(id);
        return problem;
    }

    private GeneratedProblem generatedProblem(Long id) {
        GeneratedProblem generatedProblem = new GeneratedProblem();
        generatedProblem.setId(id);
        return generatedProblem;
    }

    private ProblemAttempt attempt(Long userId, Long problemId, boolean correct, int spent, int firstAction, OffsetDateTime createdAt) {
        return ProblemAttempt.builder()
                .user(user)
                .problem(problem(problemId))
                .correct(correct)
                .timeSpentSeconds(spent)
                .timeToFirstActionSeconds(firstAction)
                .hintUsed(false)
                .errorType(com.dmc.problem.entity.ErrorType.ARITHMETIC_ERROR)
                .difficultyAtAttempt(Difficulty.MEDIUM)
                .topicSlug("combinatorics")
                .topicPath("math.combinatorics")
                .createdAt(createdAt)
                .build();
    }
}
