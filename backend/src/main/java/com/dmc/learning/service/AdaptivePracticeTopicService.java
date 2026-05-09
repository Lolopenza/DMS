package com.dmc.learning.service;

import com.dmc.common.exception.ApiException;
import com.dmc.learning.config.PracticeTopics;
import com.dmc.learning.dto.AdaptivePracticeTopicDto;
import com.dmc.problem.bkt.BktMasteryMath;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdaptivePracticeTopicService {

    private final StudentSkillRepository studentSkillRepository;
    private final UserRepository userRepository;

    public AdaptivePracticeTopicDto resolveWeakestTopic(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        Map<String, StudentSkill> skillByTopic = studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
                .collect(Collectors.toMap(StudentSkill::getTopicSlug, s -> s, (a, b) -> a, HashMap::new));

        List<String> slugs = PracticeTopics.ALL_SLUGS;
        String best = slugs.stream()
                .min(Comparator
                        .comparingDouble((String slug) -> BktMasteryMath.adjustedPknow(skillByTopic, slug))
                        .thenComparing(Comparator.naturalOrder()))
                .orElse(slugs.get(0));

        double adj = BktMasteryMath.adjustedPknow(skillByTopic, best);
        String reason = String.format(
                "Lowest reliability-adjusted mastery in the practice catalog (~%.0f%%). Extra reps here tighten your Bayesian skill estimate fastest.",
                adj * 100.0
        );

        return new AdaptivePracticeTopicDto(best, adj, reason);
    }
}
