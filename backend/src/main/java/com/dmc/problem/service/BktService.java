package com.dmc.problem.service;

import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/**
 * Bayesian Knowledge Tracing (BKT) service.
 *
 * Implements the classic Corbett–Anderson BKT model (1994) with four
 * per-skill parameters:
 *   P(L₀) — initial probability of mastery  (p_know at creation)
 *   P(G)  — probability of guessing correctly when skill is NOT known
 *   P(S)  — probability of slipping (incorrect answer when skill IS known)
 *   P(T)  — probability of learning transition after each opportunity
 *
 * Update step (per observation):
 *   1. Posterior from observation (Bayes rule):
 *        correct:   P(Lₙ|obs) = P(Lₙ)·(1−P(S)) / [P(Lₙ)·(1−P(S)) + (1−P(Lₙ))·P(G)]
 *        incorrect: P(Lₙ|obs) = P(Lₙ)·P(S)     / [P(Lₙ)·P(S)     + (1−P(Lₙ))·(1−P(G))]
 *   2. Accounting for learning transition:
 *        P(Lₙ₊₁) = P(Lₙ|obs) + (1 − P(Lₙ|obs))·P(T)
 */
@Service
@RequiredArgsConstructor
public class BktService {

    public static final double P_INITIAL = 0.25;
    public static final double P_GUESS   = 0.20;
    public static final double P_SLIP    = 0.10;
    public static final double P_TRANSIT = 0.10;

    private final StudentSkillRepository studentSkillRepository;

    @Transactional
    public StudentSkill updateSkill(User user, String topicSlug, boolean isCorrect) {
        StudentSkill skill = studentSkillRepository.findByUserAndTopicSlug(user, topicSlug)
                .orElseGet(() -> createDefaultSkill(user, topicSlug));

        double pKnow  = skill.getPKnow();
        double pGuess = skill.getPGuess();
        double pSlip  = skill.getPSlip();
        double pTransit = skill.getPTransit();

        double pKnowPosterior;
        if (isCorrect) {
            double pCorrectKnown   = pKnow * (1.0 - pSlip);
            double pCorrectUnknown = (1.0 - pKnow) * pGuess;
            pKnowPosterior = pCorrectKnown / (pCorrectKnown + pCorrectUnknown);
        } else {
            double pIncorrectKnown   = pKnow * pSlip;
            double pIncorrectUnknown = (1.0 - pKnow) * (1.0 - pGuess);
            pKnowPosterior = pIncorrectKnown / (pIncorrectKnown + pIncorrectUnknown);
        }

        double pKnowNew = pKnowPosterior + (1.0 - pKnowPosterior) * pTransit;

        pKnowNew = Math.max(0.0, Math.min(1.0, pKnowNew));

        skill.setPKnow(pKnowNew);
        skill.setTotalAttempts(skill.getTotalAttempts() + 1);
        if (isCorrect) {
            skill.setCorrectAttempts(skill.getCorrectAttempts() + 1);
        }

        return studentSkillRepository.save(skill);
    }

    public StudentSkill getOrCreateSkill(User user, String topicSlug) {
        return studentSkillRepository.findByUserAndTopicSlug(user, topicSlug)
                .orElseGet(() -> createDefaultSkill(user, topicSlug));
    }

    private StudentSkill createDefaultSkill(User user, String topicSlug) {
        StudentSkill skill = StudentSkill.builder()
                .user(user)
                .topicSlug(topicSlug)
                .pKnow(P_INITIAL)
                .pGuess(P_GUESS)
                .pSlip(P_SLIP)
                .pTransit(P_TRANSIT)
                .totalAttempts(0)
                .correctAttempts(0)
                .build();
        return studentSkillRepository.save(skill);
    }
}
