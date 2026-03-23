package com.dmc.learning.controller;

import com.dmc.auth.dto.MessageResponse;
import com.dmc.common.exception.ApiException;
import com.dmc.common.security.UserPrincipal;
import com.dmc.learning.dto.CourseDto;
import com.dmc.learning.dto.CourseModuleDto;
import com.dmc.learning.dto.LessonDto;
import com.dmc.learning.dto.LessonProgressDto;
import com.dmc.learning.service.LearningService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class LearningController {

    private final LearningService learningService;

    @GetMapping("/learning/courses")
    public ResponseEntity<List<CourseDto>> listCourses() {
        return ResponseEntity.ok(learningService.listCourses());
    }

    @GetMapping("/learning/courses/{courseId}/modules")
    public ResponseEntity<List<CourseModuleDto>> listModules(@PathVariable Long courseId) {
        return ResponseEntity.ok(learningService.listModules(courseId));
    }

    @GetMapping("/learning/modules/{moduleId}/lessons")
    public ResponseEntity<List<LessonDto>> listLessons(@PathVariable Long moduleId) {
        return ResponseEntity.ok(learningService.listLessons(moduleId));
    }

    @GetMapping("/learning/progress")
    public ResponseEntity<List<LessonProgressDto>> myProgress() {
        return ResponseEntity.ok(learningService.userProgress(currentUserId()));
    }

    @PostMapping("/learning/lessons/{lessonId}/complete")
    public ResponseEntity<LessonProgressDto> completeLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(learningService.markLessonCompleted(currentUserId(), lessonId));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/admin/courses")
    public ResponseEntity<CourseDto> createCourse(@RequestBody CourseDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningService.createCourse(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/admin/courses/{id}")
    public ResponseEntity<CourseDto> updateCourse(@PathVariable Long id, @RequestBody CourseDto request) {
        return ResponseEntity.ok(learningService.updateCourse(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/admin/courses/{id}")
    public ResponseEntity<MessageResponse> deleteCourse(@PathVariable Long id) {
        learningService.deleteCourse(id);
        return ResponseEntity.ok(new MessageResponse("Course deleted"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/admin/modules")
    public ResponseEntity<CourseModuleDto> createModule(@RequestBody CourseModuleDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningService.createModule(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/admin/modules/{id}")
    public ResponseEntity<CourseModuleDto> updateModule(@PathVariable Long id, @RequestBody CourseModuleDto request) {
        return ResponseEntity.ok(learningService.updateModule(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/admin/modules/{id}")
    public ResponseEntity<MessageResponse> deleteModule(@PathVariable Long id) {
        learningService.deleteModule(id);
        return ResponseEntity.ok(new MessageResponse("Module deleted"));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PostMapping("/admin/lessons")
    public ResponseEntity<LessonDto> createLesson(@RequestBody LessonDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningService.createLesson(request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @PutMapping("/admin/lessons/{id}")
    public ResponseEntity<LessonDto> updateLesson(@PathVariable Long id, @RequestBody LessonDto request) {
        return ResponseEntity.ok(learningService.updateLesson(id, request));
    }

    @PreAuthorize("hasAnyRole('ADMIN','TEACHER')")
    @DeleteMapping("/admin/lessons/{id}")
    public ResponseEntity<MessageResponse> deleteLesson(@PathVariable Long id) {
        learningService.deleteLesson(id);
        return ResponseEntity.ok(new MessageResponse("Lesson deleted"));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
        }
        return principal.getId();
    }
}
