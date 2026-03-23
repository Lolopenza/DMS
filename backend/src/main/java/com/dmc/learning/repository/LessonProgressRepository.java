package com.dmc.learning.repository;

import com.dmc.learning.entity.Lesson;
import com.dmc.learning.entity.LessonProgress;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface LessonProgressRepository extends JpaRepository<LessonProgress, Long> {
    Optional<LessonProgress> findByUserAndLesson(User user, Lesson lesson);
    List<LessonProgress> findByUser(User user);
}
