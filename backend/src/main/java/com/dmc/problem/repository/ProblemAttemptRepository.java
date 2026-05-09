package com.dmc.problem.repository;

import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.OffsetDateTime;
import java.util.List;

public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {
    List<ProblemAttempt> findByUserOrderByCreatedAtDesc(User user);
    List<ProblemAttempt> findByUserAndCreatedAtAfterOrderByTopicSlugAscCreatedAtDesc(User user, OffsetDateTime createdAtAfter);

    long countByUser(User user);

    long countByUserAndCreatedAtAfter(User user, OffsetDateTime createdAtAfter);

    List<ProblemAttempt> findByUserAndTopicSlugOrderByCreatedAtAsc(User user, String topicSlug);
}
