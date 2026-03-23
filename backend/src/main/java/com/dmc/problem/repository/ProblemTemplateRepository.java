package com.dmc.problem.repository;

import com.dmc.problem.entity.ProblemTemplate;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProblemTemplateRepository extends JpaRepository<ProblemTemplate, Long> {
    List<ProblemTemplate> findByDeletedAtIsNullAndActiveTrueOrderByCreatedAtDesc();
}
