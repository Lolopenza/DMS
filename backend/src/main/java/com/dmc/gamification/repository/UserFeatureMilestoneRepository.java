package com.dmc.gamification.repository;

import com.dmc.gamification.entity.UserFeatureMilestone;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserFeatureMilestoneRepository extends JpaRepository<UserFeatureMilestone, Long> {
    boolean existsByUserAndFeatureKey(User user, String featureKey);

    Optional<UserFeatureMilestone> findByUserAndFeatureKey(User user, String featureKey);
}
