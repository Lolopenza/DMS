package com.dmc.learning.service;

import com.dmc.common.exception.ApiException;
import com.dmc.learning.dto.CourseDto;
import com.dmc.learning.dto.CourseModuleDto;
import com.dmc.learning.dto.LessonDto;
import com.dmc.learning.dto.LessonProgressDto;
import com.dmc.learning.entity.Course;
import com.dmc.learning.entity.CourseModule;
import com.dmc.learning.entity.Lesson;
import com.dmc.learning.entity.LessonProgress;
import com.dmc.learning.repository.CourseModuleRepository;
import com.dmc.learning.repository.CourseRepository;
import com.dmc.learning.repository.LessonProgressRepository;
import com.dmc.learning.repository.LessonRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LearningService {

    private final CourseRepository courseRepository;
    private final CourseModuleRepository moduleRepository;
    private final LessonRepository lessonRepository;
    private final LessonProgressRepository lessonProgressRepository;
    private final UserRepository userRepository;

    public List<CourseDto> listCourses() {
        return courseRepository.findByDeletedAtIsNullOrderByOrderIndexAsc().stream()
                .map(this::toCourseDto)
                .toList();
    }

    @Transactional
    public CourseDto createCourse(CourseDto request) {
        Course course = Course.builder()
                .title(request.title())
                .slug(request.slug())
                .description(request.description())
                .orderIndex(request.orderIndex() == null ? 0 : request.orderIndex())
                .published(Boolean.TRUE.equals(request.published()))
                .build();
        return toCourseDto(courseRepository.save(course));
    }

    @Transactional
    public CourseDto updateCourse(Long id, CourseDto request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Course not found"));
        course.setTitle(request.title());
        course.setSlug(request.slug());
        course.setDescription(request.description());
        course.setOrderIndex(request.orderIndex() == null ? 0 : request.orderIndex());
        course.setPublished(Boolean.TRUE.equals(request.published()));
        return toCourseDto(courseRepository.save(course));
    }

    @Transactional
    public void deleteCourse(Long id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Course not found"));
        course.setDeletedAt(OffsetDateTime.now());
        courseRepository.save(course);
    }

    public List<CourseModuleDto> listModules(Long courseId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Course not found"));
        return moduleRepository.findByCourseAndDeletedAtIsNullOrderByOrderIndexAsc(course).stream()
                .map(this::toModuleDto)
                .toList();
    }

    @Transactional
    public CourseModuleDto createModule(CourseModuleDto request) {
        Course course = courseRepository.findById(request.courseId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "COURSE_NOT_FOUND", "Course not found"));
        CourseModule module = CourseModule.builder()
                .course(course)
                .title(request.title())
                .orderIndex(request.orderIndex() == null ? 0 : request.orderIndex())
                .build();
        return toModuleDto(moduleRepository.save(module));
    }

    @Transactional
    public CourseModuleDto updateModule(Long id, CourseModuleDto request) {
        CourseModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));
        module.setTitle(request.title());
        module.setOrderIndex(request.orderIndex() == null ? 0 : request.orderIndex());
        return toModuleDto(moduleRepository.save(module));
    }

    @Transactional
    public void deleteModule(Long id) {
        CourseModule module = moduleRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));
        module.setDeletedAt(OffsetDateTime.now());
        moduleRepository.save(module);
    }

    public List<LessonDto> listLessons(Long moduleId) {
        CourseModule module = moduleRepository.findById(moduleId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));
        return lessonRepository.findByModuleAndDeletedAtIsNullOrderByOrderIndexAsc(module).stream()
                .map(this::toLessonDto)
                .toList();
    }

    @Transactional
    public LessonDto createLesson(LessonDto request) {
        CourseModule module = moduleRepository.findById(request.moduleId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "MODULE_NOT_FOUND", "Module not found"));
        Lesson lesson = Lesson.builder()
                .module(module)
                .title(request.title())
                .slug(request.slug())
                .contentText(request.contentText())
                .contentVideoUrl(request.contentVideoUrl())
                .freeOnly(Boolean.TRUE.equals(request.freeOnly()))
                .orderIndex(request.orderIndex() == null ? 0 : request.orderIndex())
                .build();
        return toLessonDto(lessonRepository.save(lesson));
    }

    @Transactional
    public LessonDto updateLesson(Long id, LessonDto request) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Lesson not found"));
        lesson.setTitle(request.title());
        lesson.setSlug(request.slug());
        lesson.setContentText(request.contentText());
        lesson.setContentVideoUrl(request.contentVideoUrl());
        lesson.setFreeOnly(Boolean.TRUE.equals(request.freeOnly()));
        lesson.setOrderIndex(request.orderIndex() == null ? 0 : request.orderIndex());
        return toLessonDto(lessonRepository.save(lesson));
    }

    @Transactional
    public void deleteLesson(Long id) {
        Lesson lesson = lessonRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Lesson not found"));
        lesson.setDeletedAt(OffsetDateTime.now());
        lessonRepository.save(lesson);
    }

    @Transactional
    public LessonProgressDto markLessonCompleted(Long userId, Long lessonId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        Lesson lesson = lessonRepository.findById(lessonId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "LESSON_NOT_FOUND", "Lesson not found"));

        OffsetDateTime now = OffsetDateTime.now();
        LessonProgress progress = lessonProgressRepository.findByUserAndLesson(user, lesson)
                .orElseGet(() -> LessonProgress.builder()
                        .user(user)
                        .lesson(lesson)
                        .createdAt(now)
                        .build());

        progress.setCompletedAt(now);
        return toProgressDto(lessonProgressRepository.save(progress));
    }

    public List<LessonProgressDto> userProgress(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return lessonProgressRepository.findByUser(user).stream()
                .map(this::toProgressDto)
                .toList();
    }

    private CourseDto toCourseDto(Course course) {
        return new CourseDto(
                course.getId(),
                course.getTitle(),
                course.getSlug(),
                course.getDescription(),
                course.getOrderIndex(),
                course.getPublished()
        );
    }

    private CourseModuleDto toModuleDto(CourseModule module) {
        return new CourseModuleDto(
                module.getId(),
                module.getCourse().getId(),
                module.getTitle(),
                module.getOrderIndex()
        );
    }

    private LessonDto toLessonDto(Lesson lesson) {
        return new LessonDto(
                lesson.getId(),
                lesson.getModule().getId(),
                lesson.getTitle(),
                lesson.getSlug(),
                lesson.getContentText(),
                lesson.getContentVideoUrl(),
                lesson.getFreeOnly(),
                lesson.getOrderIndex()
        );
    }

    private LessonProgressDto toProgressDto(LessonProgress progress) {
        return new LessonProgressDto(progress.getLesson().getId(), progress.getCompletedAt());
    }
}
