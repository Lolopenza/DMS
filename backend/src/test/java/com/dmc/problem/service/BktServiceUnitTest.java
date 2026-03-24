package com.dmc.problem.service;

import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.within;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class BktServiceUnitTest {

    private StudentSkillRepository repository;
    private BktService bktService;
    private User user;

    @BeforeEach
    void setUp() {
        repository = mock(StudentSkillRepository.class);
        bktService = new BktService(repository);
        user = User.builder().id(1L).email("test@test.com").username("test").password("pwd").build();

        when(repository.save(any(StudentSkill.class))).thenAnswer(inv -> inv.getArgument(0));
    }

    @Test
    void correctAnswerIncreasesKnowledge() {
        StudentSkill skill = defaultSkill();
        when(repository.findByUserAndTopicSlug(eq(user), eq("combinatorics")))
                .thenReturn(Optional.of(skill));

        StudentSkill updated = bktService.updateSkill(user, "combinatorics", true);

        assertThat(updated.getPKnow()).isGreaterThan(BktService.P_INITIAL);
    }

    @Test
    void incorrectAnswerDecreasesKnowledge() {
        StudentSkill skill = defaultSkill();
        skill.setPKnow(0.5);
        when(repository.findByUserAndTopicSlug(eq(user), eq("combinatorics")))
                .thenReturn(Optional.of(skill));

        StudentSkill updated = bktService.updateSkill(user, "combinatorics", false);

        assertThat(updated.getPKnow()).isLessThan(0.5);
    }

    @Test
    void correctAnswerFormula_defaultParams() {
        // P(know)=0.25, P(slip)=0.10, P(guess)=0.20, P(transit)=0.10
        // Posterior = (0.25 * 0.90) / (0.25 * 0.90 + 0.75 * 0.20) = 0.225 / 0.375 = 0.600
        // After transit = 0.600 + (1 - 0.600) * 0.10 = 0.640
        StudentSkill skill = defaultSkill();
        when(repository.findByUserAndTopicSlug(eq(user), eq("combinatorics")))
                .thenReturn(Optional.of(skill));

        StudentSkill updated = bktService.updateSkill(user, "combinatorics", true);

        assertThat(updated.getPKnow()).isCloseTo(0.64, within(0.001));
        assertThat(updated.getTotalAttempts()).isEqualTo(1);
        assertThat(updated.getCorrectAttempts()).isEqualTo(1);
    }

    @Test
    void incorrectAnswerFormula_fromHighKnowledge() {
        // P(know)=0.640, P(slip)=0.10, P(guess)=0.20, P(transit)=0.10
        // Posterior = (0.640 * 0.10) / (0.640 * 0.10 + 0.360 * 0.80) = 0.064 / 0.352 ≈ 0.18182
        // After transit = 0.18182 + (1 - 0.18182) * 0.10 ≈ 0.26364
        StudentSkill skill = defaultSkill();
        skill.setPKnow(0.640);
        when(repository.findByUserAndTopicSlug(eq(user), eq("combinatorics")))
                .thenReturn(Optional.of(skill));

        StudentSkill updated = bktService.updateSkill(user, "combinatorics", false);

        assertThat(updated.getPKnow()).isCloseTo(0.2636, within(0.001));
        assertThat(updated.getTotalAttempts()).isEqualTo(1);
        assertThat(updated.getCorrectAttempts()).isEqualTo(0);
    }

    @Test
    void multipleCorrectAnswers_convergesToHigh() {
        StudentSkill skill = defaultSkill();
        when(repository.findByUserAndTopicSlug(eq(user), eq("logic")))
                .thenReturn(Optional.of(skill));

        for (int i = 0; i < 10; i++) {
            bktService.updateSkill(user, "logic", true);
        }

        assertThat(skill.getPKnow()).isGreaterThan(0.90);
        assertThat(skill.getTotalAttempts()).isEqualTo(10);
        assertThat(skill.getCorrectAttempts()).isEqualTo(10);
    }

    @Test
    void pKnowNeverExceedsOne() {
        StudentSkill skill = defaultSkill();
        skill.setPKnow(0.99);
        when(repository.findByUserAndTopicSlug(eq(user), eq("logic")))
                .thenReturn(Optional.of(skill));

        bktService.updateSkill(user, "logic", true);

        assertThat(skill.getPKnow()).isLessThanOrEqualTo(1.0);
        assertThat(skill.getPKnow()).isGreaterThanOrEqualTo(0.0);
    }

    @Test
    void pKnowNeverBelowZero() {
        StudentSkill skill = defaultSkill();
        skill.setPKnow(0.01);
        when(repository.findByUserAndTopicSlug(eq(user), eq("logic")))
                .thenReturn(Optional.of(skill));

        bktService.updateSkill(user, "logic", false);

        assertThat(skill.getPKnow()).isGreaterThanOrEqualTo(0.0);
    }

    @Test
    void createsDefaultSkillWhenNotFound() {
        when(repository.findByUserAndTopicSlug(eq(user), eq("new-topic")))
                .thenReturn(Optional.empty());

        StudentSkill skill = bktService.getOrCreateSkill(user, "new-topic");

        assertThat(skill.getPKnow()).isEqualTo(BktService.P_INITIAL);
        assertThat(skill.getPGuess()).isEqualTo(BktService.P_GUESS);
        assertThat(skill.getPSlip()).isEqualTo(BktService.P_SLIP);
        assertThat(skill.getPTransit()).isEqualTo(BktService.P_TRANSIT);
        assertThat(skill.getTotalAttempts()).isEqualTo(0);
        assertThat(skill.getCorrectAttempts()).isEqualTo(0);
    }

    private StudentSkill defaultSkill() {
        return StudentSkill.builder()
                .user(user)
                .topicSlug("combinatorics")
                .pKnow(BktService.P_INITIAL)
                .pGuess(BktService.P_GUESS)
                .pSlip(BktService.P_SLIP)
                .pTransit(BktService.P_TRANSIT)
                .totalAttempts(0)
                .correctAttempts(0)
                .build();
    }
}
