package com.dmc.problem.repository;

import com.dmc.problem.entity.GeneratedProblem;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface GeneratedProblemAttemptRepository extends JpaRepository<GeneratedProblemAttempt, Long> {
    List<GeneratedProblemAttempt> findByGeneratedProblemOrderByCreatedAtDesc(GeneratedProblem generatedProblem);

    List<GeneratedProblemAttempt> findByUserAndCreatedAtAfter(User user, OffsetDateTime createdAtAfter);
    List<GeneratedProblemAttempt> findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(User user, OffsetDateTime createdAtAfter);

    long countByUser(User user);

    long countByUserAndCreatedAtAfter(User user, OffsetDateTime createdAtAfter);

    List<GeneratedProblemAttempt> findByUserAndTopicSlugOrderByCreatedAtAsc(User user, String topicSlug);
}
