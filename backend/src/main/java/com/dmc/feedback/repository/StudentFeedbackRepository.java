package com.dmc.feedback.repository;

import com.dmc.feedback.entity.StudentFeedback;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentFeedbackRepository extends JpaRepository<StudentFeedback, Long> {
    boolean existsByUserId(Long userId);
}
