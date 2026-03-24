package com.dmc.problem.repository;

import com.dmc.problem.entity.GeneratedProblem;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GeneratedProblemAttemptRepository extends JpaRepository<GeneratedProblemAttempt, Long> {
    List<GeneratedProblemAttempt> findByGeneratedProblemOrderByCreatedAtDesc(GeneratedProblem generatedProblem);
}
