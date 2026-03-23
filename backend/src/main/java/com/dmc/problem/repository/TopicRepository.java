package com.dmc.problem.repository;

import com.dmc.problem.entity.Topic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicRepository extends JpaRepository<Topic, Long> {
    List<Topic> findByDeletedAtIsNullOrderByNameAsc();
    Optional<Topic> findBySlugAndDeletedAtIsNull(String slug);
}
