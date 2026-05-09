package com.dmc.learning.controller;

import com.dmc.auth.dto.MessageResponse;
import com.dmc.common.exception.ApiException;
import com.dmc.common.security.UserPrincipal;
import com.dmc.learning.dto.CourseDto;
import com.dmc.learning.dto.CourseModuleDto;
import com.dmc.learning.dto.LessonDto;
import com.dmc.learning.dto.LessonProgressDto;
import com.dmc.learning.dto.AdaptivePracticeTopicDto;
import com.dmc.learning.dto.LearningJourneySnapshotDto;
import com.dmc.learning.dto.ModuleCatalogEntryDto;
import com.dmc.learning.dto.ModuleRecommendationDto;
import com.dmc.learning.dto.SubjectProgressDto;
import com.dmc.learning.service.AdaptivePracticeTopicService;
import com.dmc.learning.service.LearningCatalogService;
import com.dmc.learning.service.LearningProgressService;
import com.dmc.learning.service.LearningService;
import com.dmc.learning.service.RecommendationService;
import jakarta.validation.Valid;
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
    private final RecommendationService recommendationService;
    private final AdaptivePracticeTopicService adaptivePracticeTopicService;
    private final LearningCatalogService learningCatalogService;
    private final LearningProgressService learningProgressService;

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

    /**
     * Personalized module recommendations from BKT mastery + prerequisite graph.
     */
    @GetMapping("/learning/recommendations")
    public ResponseEntity<List<ModuleRecommendationDto>> learningRecommendations() {
        return ResponseEntity.ok(recommendationService.recommendModules(currentUserId()));
    }

    /**
     * Weakest interactive-practice topic by adjusted Bayesian mastery (practice catalog only).
     */
    @GetMapping("/learning/adaptive-practice-topic")
    public ResponseEntity<AdaptivePracticeTopicDto> adaptivePracticeTopic() {
        return ResponseEntity.ok(adaptivePracticeTopicService.resolveWeakestTopic(currentUserId()));
    }

    /**
     * Static calculator catalog: maps UI route segments to BKT {@code skillTopicSlug}.
     */
    @GetMapping("/learning/catalog/modules")
    public ResponseEntity<List<ModuleCatalogEntryDto>> moduleCatalog() {
        return ResponseEntity.ok(learningCatalogService.listModuleCatalog());
    }

    /**
     * Per-subject aggregates: average adjusted mastery and module counts above completion threshold.
     */
    @GetMapping("/learning/progress/subjects")
    public ResponseEntity<List<SubjectProgressDto>> progressBySubject() {
        return ResponseEntity.ok(learningProgressService.subjectProgress(currentUserId()));
    }

    /**
     * Global journey bar + next recommended module for dashboard card.
     */
    @GetMapping("/learning/progress/journey")
    public ResponseEntity<LearningJourneySnapshotDto> learningJourney() {
        return ResponseEntity.ok(learningProgressService.journeySnapshot(currentUserId()));
    }

    @PostMapping("/learning/lessons/{lessonId}/complete")
    public ResponseEntity<LessonProgressDto> completeLesson(@PathVariable Long lessonId) {
        return ResponseEntity.ok(learningService.markLessonCompleted(currentUserId(), lessonId));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/courses")
    public ResponseEntity<CourseDto> createCourse(@Valid @RequestBody CourseDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningService.createCourse(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/courses/{id}")
    public ResponseEntity<CourseDto> updateCourse(@PathVariable Long id, @Valid @RequestBody CourseDto request) {
        return ResponseEntity.ok(learningService.updateCourse(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/courses/{id}")
    public ResponseEntity<MessageResponse> deleteCourse(@PathVariable Long id) {
        learningService.deleteCourse(id);
        return ResponseEntity.ok(new MessageResponse("Course deleted"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/modules")
    public ResponseEntity<CourseModuleDto> createModule(@Valid @RequestBody CourseModuleDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningService.createModule(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/modules/{id}")
    public ResponseEntity<CourseModuleDto> updateModule(@PathVariable Long id, @Valid @RequestBody CourseModuleDto request) {
        return ResponseEntity.ok(learningService.updateModule(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/admin/modules/{id}")
    public ResponseEntity<MessageResponse> deleteModule(@PathVariable Long id) {
        learningService.deleteModule(id);
        return ResponseEntity.ok(new MessageResponse("Module deleted"));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/admin/lessons")
    public ResponseEntity<LessonDto> createLesson(@Valid @RequestBody LessonDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(learningService.createLesson(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/admin/lessons/{id}")
    public ResponseEntity<LessonDto> updateLesson(@PathVariable Long id, @Valid @RequestBody LessonDto request) {
        return ResponseEntity.ok(learningService.updateLesson(id, request));
    }

    @PreAuthorize("hasRole('ADMIN')")
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
