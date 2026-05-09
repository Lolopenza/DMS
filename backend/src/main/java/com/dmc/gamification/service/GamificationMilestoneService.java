package com.dmc.gamification.service;

import com.dmc.gamification.entity.UserFeatureMilestone;
import com.dmc.gamification.repository.UserFeatureMilestoneRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dmc.common.exception.ApiException;

/**
 * First-touch milestones (e.g. learning export) for achievement rules.
 */
@Service
@RequiredArgsConstructor
public class GamificationMilestoneService {

    public static final String FEATURE_LEARNING_EXPORT = "learning_export";

    private final UserRepository userRepository;
    private final UserFeatureMilestoneRepository milestoneRepository;

    @Transactional
    public void recordLearningExportIfFirst(long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        if (milestoneRepository.existsByUserAndFeatureKey(user, FEATURE_LEARNING_EXPORT)) {
            return;
        }
        UserFeatureMilestone row = new UserFeatureMilestone();
        row.setUser(user);
        row.setFeatureKey(FEATURE_LEARNING_EXPORT);
        try {
            milestoneRepository.save(row);
        } catch (DataIntegrityViolationException ignored) {
            // Concurrent first-touch or duplicate; milestone already recorded.
        }
    }
}
