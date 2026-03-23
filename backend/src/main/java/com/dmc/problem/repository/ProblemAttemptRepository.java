package com.dmc.problem.repository;

import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemAttemptRepository extends JpaRepository<ProblemAttempt, Long> {
    List<ProblemAttempt> findByUserOrderByCreatedAtDesc(User user);
}
