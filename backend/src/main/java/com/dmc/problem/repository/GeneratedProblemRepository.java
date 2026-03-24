package com.dmc.problem.repository;

import com.dmc.problem.entity.GeneratedProblem;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GeneratedProblemRepository extends JpaRepository<GeneratedProblem, Long> {
    List<GeneratedProblem> findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(User user);
    Optional<GeneratedProblem> findByIdAndDeletedAtIsNull(Long id);
}
