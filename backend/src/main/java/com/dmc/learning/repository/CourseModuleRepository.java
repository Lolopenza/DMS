package com.dmc.learning.repository;

import com.dmc.learning.entity.Course;
import com.dmc.learning.entity.CourseModule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseModuleRepository extends JpaRepository<CourseModule, Long> {
    List<CourseModule> findByCourseAndDeletedAtIsNullOrderByOrderIndexAsc(Course course);
}
