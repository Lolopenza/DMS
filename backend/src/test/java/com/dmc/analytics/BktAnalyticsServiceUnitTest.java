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

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BktAnalyticsServiceUnitTest {

    private UserRepository userRepository;
    private StudentSkillRepository studentSkillRepository;
    private ProblemAttemptRepository problemAttemptRepository;
    private GeneratedProblemAttemptRepository generatedProblemAttemptRepository;
    private BktAnalyticsService service;
    private User user;

    @BeforeEach
    void setUp() {
        userRepository = mock(UserRepository.class);
        studentSkillRepository = mock(StudentSkillRepository.class);
        problemAttemptRepository = mock(ProblemAttemptRepository.class);
        generatedProblemAttemptRepository = mock(GeneratedProblemAttemptRepository.class);

        MathEngineProperties props = new MathEngineProperties();
        props.setApiKey("secret-key");
        service = new BktAnalyticsService(
                userRepository,
                studentSkillRepository,
                problemAttemptRepository,
                generatedProblemAttemptRepository,
                props
        );

        user = User.builder()
                .id(11L)
                .email("student@example.com")
                .username("student")
                .password("pwd")
                .build();
    }

    @Test
    void rawDataset_repairsInvalidTimesAndTracksMetadata() {
        when(userRepository.findById(11L)).thenReturn(Optional.of(user));
        when(studentSkillRepository.findByUserOrderByUpdatedAtDesc(any())).thenReturn(List.of());

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
    void summaryForUser_buildsStableAggregatesForMixedAttempts() {
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
    void summaryForUser_rejectsInvalidWindow() {
        assertThatThrownBy(() -> service.summaryForUser(11L, 0))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("windowDays must be between 1 and 365");
        assertThatThrownBy(() -> service.summaryForUser(11L, 366))
                .isInstanceOf(ApiException.class);
    }

    @Test
    void assertInternalKey_rejectsWrongKeyWhenConfigured() {
        assertThatThrownBy(() -> service.assertInternalKey("wrong"))
                .isInstanceOf(ApiException.class)
                .hasMessageContaining("Invalid internal API key");
        service.assertInternalKey("secret-key");
    }
}
