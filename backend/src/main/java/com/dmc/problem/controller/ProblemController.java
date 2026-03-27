package com.dmc.problem.controller;

import com.dmc.common.exception.ApiException;
import com.dmc.common.security.UserPrincipal;
import com.dmc.problem.dto.GeneratedProblemDto;
import com.dmc.problem.dto.GeneratedProblemAttemptRequest;
import com.dmc.problem.dto.GeneratedProblemAttemptResponse;
import com.dmc.problem.dto.GeneratedProblemItemDto;
import com.dmc.problem.dto.InteractiveProblemGenerateRequest;
import com.dmc.problem.dto.NextProblemResponse;
import com.dmc.problem.dto.ProblemAttemptRequest;
import com.dmc.problem.dto.ProblemAttemptResponse;
import com.dmc.problem.dto.ProblemDto;
import com.dmc.problem.dto.ProblemTemplateDto;
import com.dmc.problem.dto.StudentSkillDto;
import com.dmc.problem.dto.TemplateValidationRequest;
import com.dmc.problem.dto.TopicDto;
import com.dmc.problem.service.ProblemService;
import com.dmc.learning.dto.LearningFeedbackRequest;
import com.dmc.learning.dto.LearningFeedbackResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/problems")
@RequiredArgsConstructor
public class ProblemController {

    private final ProblemService problemService;

    @GetMapping
    public ResponseEntity<List<ProblemDto>> listProblems(
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty
    ) {
        return ResponseEntity.ok(problemService.listProblems(topic, difficulty));
    }

    @PostMapping("/{id}/attempt")
    public ResponseEntity<ProblemAttemptResponse> submitAttempt(@PathVariable Long id, @Valid @RequestBody ProblemAttemptRequest request) {
        return ResponseEntity.ok(problemService.submitAttempt(currentUserId(), id, request));
    }

    @GetMapping("/attempts/me")
    public ResponseEntity<List<ProblemAttemptResponse>> myAttempts() {
        return ResponseEntity.ok(problemService.myAttempts(currentUserId()));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<TopicDto>> listTopics() {
        return ResponseEntity.ok(problemService.listTopics());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ProblemDto> createProblem(@Valid @RequestBody ProblemDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createProblem(request));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/topics")
    public ResponseEntity<TopicDto> createTopic(@Valid @RequestBody TopicDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createTopic(request));
    }

    @GetMapping("/templates")
    public ResponseEntity<List<ProblemTemplateDto>> listTemplates() {
        return ResponseEntity.ok(problemService.listTemplates());
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/templates")
    public ResponseEntity<ProblemTemplateDto> createTemplate(@Valid @RequestBody ProblemTemplateDto request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(problemService.createTemplate(request));
    }

    @PostMapping("/templates/{id}/generate")
    public ResponseEntity<GeneratedProblemDto> generate(@PathVariable Long id) {
        return ResponseEntity.ok(problemService.generateFromTemplate(id));
    }

    @PostMapping("/generated")
    public ResponseEntity<GeneratedProblemItemDto> generateInteractive(
            @Valid @RequestBody InteractiveProblemGenerateRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(problemService.generateInteractive(currentUserId(), request));
    }

    @GetMapping("/generated/me")
    public ResponseEntity<List<GeneratedProblemItemDto>> myGeneratedProblems() {
        return ResponseEntity.ok(problemService.myGeneratedProblems(currentUserId()));
    }

    @PostMapping("/generated/{id}/attempt")
    public ResponseEntity<GeneratedProblemAttemptResponse> submitGeneratedAttempt(
            @PathVariable Long id,
            @Valid @RequestBody GeneratedProblemAttemptRequest request
    ) {
        return ResponseEntity.ok(problemService.submitGeneratedAttempt(currentUserId(), id, request));
    }

    @PostMapping("/templates/validate")
    public ResponseEntity<Map<String, Object>> validateGenerated(
            @Valid @RequestBody TemplateValidationRequest request
    ) {
        GeneratedProblemDto generated = new GeneratedProblemDto(
            request.templateId(),
            request.question(),
            request.parameters(),
            request.answerExpression(),
            request.operation()
        );
        boolean correct = problemService.validateGeneratedAnswer(generated, request.candidateAnswer());
        return ResponseEntity.ok(Map.of("correct", correct));
    }

    @GetMapping("/next")
    public ResponseEntity<NextProblemResponse> nextAdaptiveProblem(
            @RequestParam String topic,
            @RequestParam(required = false, defaultValue = "TEMPLATE") String mode
    ) {
        return ResponseEntity.ok(problemService.getNextAdaptiveProblem(currentUserId(), topic, mode));
    }

    @GetMapping("/skills/me")
    public ResponseEntity<List<StudentSkillDto>> mySkills() {
        return ResponseEntity.ok(problemService.getStudentSkills(currentUserId()));
    }

    @GetMapping("/skills/me/{topicSlug}")
    public ResponseEntity<StudentSkillDto> mySkillForTopic(@PathVariable String topicSlug) {
        return ResponseEntity.ok(problemService.getStudentSkill(currentUserId(), topicSlug));
    }

    @PostMapping("/learning/feedback")
    public ResponseEntity<LearningFeedbackResponse> learningFeedback(@Valid @RequestBody LearningFeedbackRequest request) {
        int windowDays = request.windowDays() == null ? 30 : request.windowDays();
        int topN = request.topNTopics() == null ? 3 : request.topNTopics();
        return ResponseEntity.ok(problemService.generateLearningFeedback(currentUserId(), windowDays, topN));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
        }
        return principal.getId();
    }
}
