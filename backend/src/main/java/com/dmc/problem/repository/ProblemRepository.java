package com.dmc.problem.repository;

import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.Problem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemRepository extends JpaRepository<Problem, Long> {
    List<Problem> findByDeletedAtIsNullOrderByCreatedAtDesc();
    List<Problem> findByDeletedAtIsNullAndTopicOrderByCreatedAtDesc(String topic);
    List<Problem> findByDeletedAtIsNullAndDifficultyOrderByCreatedAtDesc(Difficulty difficulty);
    List<Problem> findByDeletedAtIsNullAndTopicAndDifficultyOrderByCreatedAtDesc(String topic, Difficulty difficulty);
}
