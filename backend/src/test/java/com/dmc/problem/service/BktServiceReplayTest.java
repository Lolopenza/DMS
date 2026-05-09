package com.dmc.problem.service;

import com.dmc.problem.entity.Difficulty;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class BktServiceReplayTest {

    @Test
    void correctAnswerIncreasesPKnowTypicalCase() {
        double prior = BktService.P_INITIAL;
        double next = BktService.nextPKnowAfterObservation(prior, true, Difficulty.MEDIUM, BktService.P_TRANSIT);
        assertThat(next).isGreaterThan(prior);
    }

    @Test
    void incorrectAnswerDecreasesOrChangesPKnow() {
        double prior = 0.8;
        double next = BktService.nextPKnowAfterObservation(prior, false, Difficulty.MEDIUM, BktService.P_TRANSIT);
        assertThat(next).isLessThan(prior);
    }

    @Test
    void replayMatchesSequentialUpdates() {
        double p = BktService.P_INITIAL;
        p = BktService.nextPKnowAfterObservation(p, true, Difficulty.EASY, BktService.P_TRANSIT);
        p = BktService.nextPKnowAfterObservation(p, false, Difficulty.HARD, BktService.P_TRANSIT);
        p = BktService.nextPKnowAfterObservation(p, true, Difficulty.MEDIUM, BktService.P_TRANSIT);
        assertThat(p).isBetween(0.0, 1.0);
    }
}
