package com.dmc.problem.repository;

import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByDeletedAtIsNullOrderByCreatedAtDesc();
    List<Problem> findByDeletedAtIsNullAndTopicOrderByCreatedAtDesc(String topic);
    List<Problem> findByDeletedAtIsNullAndDifficultyOrderByCreatedAtDesc(Difficulty difficulty);
    List<Problem> findByDeletedAtIsNullAndTopicAndDifficultyOrderByCreatedAtDesc(String topic, Difficulty difficulty);

    Page<Problem> findByDeletedAtIsNullOrderByCreatedAtDesc(Pageable pageable);

    Page<Problem> findByDeletedAtIsNullAndTopicOrderByCreatedAtDesc(String topic, Pageable pageable);
}
