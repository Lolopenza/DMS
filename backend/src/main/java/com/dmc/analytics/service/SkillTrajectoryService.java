package com.dmc.analytics.service;

import com.dmc.analytics.dto.SkillTrajectoryDto;
import com.dmc.analytics.dto.SkillTrajectoryPointDto;
import com.dmc.common.exception.ApiException;
import com.dmc.problem.bkt.BktMasteryMath;
import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.GeneratedProblemAttemptRepository;
import com.dmc.problem.repository.ProblemAttemptRepository;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.problem.service.BktService;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SkillTrajectoryService {

    private static final ZoneOffset UTC = ZoneOffset.UTC;

    private final UserRepository userRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final ProblemAttemptRepository problemAttemptRepository;
    private final GeneratedProblemAttemptRepository generatedProblemAttemptRepository;

    public SkillTrajectoryDto trajectoryForUser(long userId, String topicSlug, int windowDays) {
        if (topicSlug == null || topicSlug.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_TOPIC", "topicSlug is required");
        }
        if (windowDays <= 0 || windowDays > 365) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_WINDOW", "windowDays must be between 1 and 365");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        Map<String, StudentSkill> skillByTopic = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .collect(Collectors.toMap(StudentSkill::getTopicSlug, s -> s, (a, b) -> a, HashMap::new));

        int adjustedMastery = BktMasteryMath.adjustedMasteryPercent(skillByTopic, topicSlug);
        StudentSkill skillRow = skillByTopic.get(topicSlug);
        int storedPknowPercent = skillRow != null
                ? (int) Math.round(skillRow.getPKnow() * 100.0)
                : (int) Math.round(BktService.P_INITIAL * 100.0);

        double pTransit = skillRow != null ? skillRow.getPTransit() : BktService.P_TRANSIT;

        List<MergedAttempt> merged = mergeAttempts(user, topicSlug);
        OffsetDateTime windowEnd = OffsetDateTime.now(UTC);
        OffsetDateTime windowStart = windowEnd.minusDays(windowDays);

        double pKnow = BktService.P_INITIAL;
        List<SkillTrajectoryPointDto> windowPoints = new ArrayList<>();

        for (MergedAttempt a : merged) {
            Difficulty d = a.difficulty() != null ? a.difficulty() : Difficulty.MEDIUM;
            pKnow = BktService.nextPKnowAfterObservation(pKnow, a.correct(), d, pTransit);

            OffsetDateTime t = a.createdAt();
            if (!t.isBefore(windowStart) && !t.isAfter(windowEnd)) {
                int pct = (int) Math.round(pKnow * 100.0);
                windowPoints.add(new SkillTrajectoryPointDto(t.toString(), a.correct(), pct));
            }
        }

        String label = topicSlug.replace('_', ' ');
        return new SkillTrajectoryDto(
                topicSlug,
                label,
                windowDays,
                adjustedMastery,
                storedPknowPercent,
                windowPoints.size(),
                windowPoints
        );
    }

    private List<MergedAttempt> mergeAttempts(User user, String topicSlug) {
        List<MergedAttempt> out = new ArrayList<>();
        for (ProblemAttempt a : problemAttemptRepository.findByUserAndTopicSlugOrderByCreatedAtAsc(user, topicSlug)) {
            if (a.getCreatedAt() == null) {
                continue;
            }
            out.add(new MergedAttempt(a.getCreatedAt(), Boolean.TRUE.equals(a.getCorrect()), a.getDifficultyAtAttempt()));
        }
        for (GeneratedProblemAttempt a : generatedProblemAttemptRepository.findByUserAndTopicSlugOrderByCreatedAtAsc(user, topicSlug)) {
            if (a.getCreatedAt() == null) {
                continue;
            }
            out.add(new MergedAttempt(a.getCreatedAt(), Boolean.TRUE.equals(a.getCorrect()), a.getDifficultyAtAttempt()));
        }
        out.sort(Comparator.comparing(MergedAttempt::createdAt));
        return out;
    }

    private record MergedAttempt(OffsetDateTime createdAt, boolean correct, Difficulty difficulty) {
    }
}
