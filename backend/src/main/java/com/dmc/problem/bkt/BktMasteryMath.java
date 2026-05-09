package com.dmc.problem.bkt;

import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.service.BktService;

import java.util.Map;

/**
 * Reliability-adjusted mastery consistent with the student dashboard and {@code RecommendationService}.
 */
public final class BktMasteryMath {

    private BktMasteryMath() {
    }

    /**
     * Adjusted P(know) with reliability dampening toward the BKT prior when attempt count is low.
     */
    public static double adjustedPknow(Map<String, StudentSkill> skillByTopic, String topicSlug) {
        StudentSkill skill = skillByTopic == null ? null : skillByTopic.get(topicSlug);
        if (skill == null) {
            return BktService.P_INITIAL;
        }
        double pKnow = skill.getPKnow();
        int attempts = Math.max(0, skill.getTotalAttempts());
        double reliability = Math.min(1.0, attempts / 8.0);
        return BktService.P_INITIAL + (pKnow - BktService.P_INITIAL) * reliability;
    }

    /**
     * Percent scale (0–100), consistent with dashboard and recommendations.
     */
    public static int adjustedMasteryPercent(Map<String, StudentSkill> skillByTopic, String topicSlug) {
        return (int) Math.round(adjustedPknow(skillByTopic, topicSlug) * 100.0);
    }
}
