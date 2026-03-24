package com.dmc.problem.repository;

import com.dmc.problem.entity.ProblemTemplate;
import com.dmc.problem.entity.Difficulty;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ProblemTemplateRepository extends JpaRepository<ProblemTemplate, Long> {
    List<ProblemTemplate> findByDeletedAtIsNullAndActiveTrueOrderByCreatedAtDesc();
    List<ProblemTemplate> findByDeletedAtIsNullAndActiveTrueAndTopicSlugOrderByCreatedAtDesc(String topicSlug);
    List<ProblemTemplate> findByDeletedAtIsNullAndActiveTrueAndDifficultyOrderByCreatedAtDesc(Difficulty difficulty);
    Optional<ProblemTemplate> findByIdAndDeletedAtIsNull(Long id);
}
