package com.dmc.problem.service;

import com.dmc.common.exception.ApiException;
import com.dmc.infrastructure.mathengine.MathEngineClient;
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
import com.dmc.problem.dto.TopicDto;
import com.dmc.learning.dto.LearningFeedbackResponse;
import com.dmc.problem.entity.Difficulty;
import com.dmc.problem.entity.GeneratedProblem;
import com.dmc.problem.entity.GeneratedProblemAttempt;
import com.dmc.problem.entity.GenerationMode;
import com.dmc.problem.entity.ErrorType;
import com.dmc.problem.entity.Problem;
import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.problem.entity.ProblemTemplate;
import com.dmc.problem.entity.StudentSkill;
import com.dmc.problem.entity.Topic;
import com.dmc.problem.repository.GeneratedProblemAttemptRepository;
import com.dmc.problem.repository.GeneratedProblemRepository;
import com.dmc.problem.repository.ProblemAttemptRepository;
import com.dmc.problem.repository.ProblemRepository;
import com.dmc.problem.repository.ProblemTemplateRepository;
import com.dmc.problem.repository.StudentSkillRepository;
import com.dmc.problem.repository.TopicRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ProblemAttemptRepository problemAttemptRepository;
    private final TopicRepository topicRepository;
    private final ProblemTemplateRepository templateRepository;
    private final GeneratedProblemRepository generatedProblemRepository;
    private final GeneratedProblemAttemptRepository generatedProblemAttemptRepository;
    private final StudentSkillRepository studentSkillRepository;
    private final UserRepository userRepository;
    private final MathEngineClient mathEngineClient;
    private final BktService bktService;
    private final ObjectMapper objectMapper;

    private final Random random = new Random();
    private static final int MAX_TIME_SPENT_SECONDS = 4 * 60 * 60;

    public List<ProblemDto> listProblems(String topic, String difficulty) {
        List<Problem> problems;
        com.dmc.problem.entity.Difficulty parsedDifficulty = difficulty == null || difficulty.isBlank()
                ? null
                : com.dmc.problem.entity.Difficulty.valueOf(difficulty.toUpperCase(Locale.ROOT));
        if (topic != null && !topic.isBlank() && difficulty != null && !difficulty.isBlank()) {
            problems = problemRepository.findByDeletedAtIsNullAndTopicAndDifficultyOrderByCreatedAtDesc(topic, parsedDifficulty);
        } else if (topic != null && !topic.isBlank()) {
            problems = problemRepository.findByDeletedAtIsNullAndTopicOrderByCreatedAtDesc(topic);
        } else if (difficulty != null && !difficulty.isBlank()) {
            problems = problemRepository.findByDeletedAtIsNullAndDifficultyOrderByCreatedAtDesc(parsedDifficulty);
        } else {
            problems = problemRepository.findByDeletedAtIsNullOrderByCreatedAtDesc();
        }
        return problems.stream().map(this::toDto).toList();
    }

    public Page<ProblemDto> listProblemsPage(String topicSlug, int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        PageRequest pageable = PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "createdAt"));

        Page<Problem> problems = (topicSlug == null || topicSlug.isBlank())
                ? problemRepository.findByDeletedAtIsNullOrderByCreatedAtDesc(pageable)
                : problemRepository.findByDeletedAtIsNullAndTopicOrderByCreatedAtDesc(topicSlug, pageable);

        return problems.map(this::toDto);
    }

    @Transactional
    public ProblemDto createProblem(ProblemDto request) {
        Problem problem = Problem.builder()
                .title(request.title())
                .type(request.type())
                .difficulty(request.difficulty())
                .topic(request.topic())
                .questionText(request.questionText())
                .correctAnswer(request.correctAnswer())
                .hintText(request.hintText())
                .explanationText(request.explanationText())
                .xpReward(request.xpReward() == null ? 10 : request.xpReward())
                .freeOnly(Boolean.TRUE.equals(request.freeOnly()))
                .topics(resolveTopics(request.topicSlugs()))
                .build();
        return toDto(problemRepository.save(problem));
    }

    @Transactional
    public ProblemAttemptResponse submitAttempt(Long userId, Long problemId, ProblemAttemptRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        Problem problem = problemRepository.findById(problemId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "PROBLEM_NOT_FOUND", "Problem not found"));

        boolean correct = isCorrect(problem.getCorrectAnswer(), request.answer());
        int xp = correct ? (problem.getXpReward() == null ? 0 : problem.getXpReward()) : 0;
        ErrorType resolvedErrorType = resolveErrorType(request.errorType(), correct, problem.getHintText());

        Integer normalizedTimeSpent = sanitizeTimeSpent(request.timeSpentSeconds());
        Integer normalizedTimeToFirstAction = sanitizeTimeToFirstAction(request.timeToFirstActionSeconds(), normalizedTimeSpent);

        ProblemAttempt attempt = ProblemAttempt.builder()
                .user(user)
                .problem(problem)
                .answer(request.answer())
                .correct(correct)
                .xpEarned(xp)
                .timeSpentSeconds(normalizedTimeSpent)
                .timeToFirstActionSeconds(normalizedTimeToFirstAction)
                .hintUsed(Boolean.TRUE.equals(request.hintUsed()))
                .errorType(resolvedErrorType)
                .difficultyAtAttempt(parseDifficultyWithFallback(request.difficultyAtAttempt(), problem.getDifficulty()))
                .topicSlug(firstNonBlank(request.topicSlug(), problem.getTopic()))
                .topicPath(firstNonBlank(request.topicPath(), resolveTopicPath(problem.getTopic())))
                .createdAt(OffsetDateTime.now())
                .build();
        problemAttemptRepository.save(attempt);

        if (problem.getTopic() != null && !problem.getTopic().isBlank()) {
            bktService.updateSkill(user, problem.getTopic(), correct);
        }

        return new ProblemAttemptResponse(
                problem.getId(),
                correct,
                xp,
                correct ? "Correct" : "Try again",
                correct ? problem.getExplanationText() : problem.getHintText()
        );
    }

    public List<ProblemAttemptResponse> myAttempts(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return problemAttemptRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(a -> new ProblemAttemptResponse(
                        a.getProblem().getId(),
                        a.getCorrect(),
                        a.getXpEarned(),
                        a.getCorrect() ? "Correct" : "Incorrect",
                        a.getProblem().getExplanationText()
                ))
                .toList();
    }

    public List<TopicDto> listTopics() {
        return topicRepository.findByDeletedAtIsNullOrderByNameAsc().stream()
                .map(t -> new TopicDto(t.getId(), t.getName(), t.getSlug(), t.getParent() == null ? null : t.getParent().getId()))
                .toList();
    }

    @Transactional
    public TopicDto createTopic(TopicDto request) {
        Topic parent = null;
        if (request.parentId() != null) {
            parent = topicRepository.findById(request.parentId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TOPIC_NOT_FOUND", "Parent topic not found"));
        }

        Topic topic = Topic.builder()
                .name(request.name())
                .slug(request.slug())
                .parent(parent)
                .build();
        Topic saved = topicRepository.save(topic);
        return new TopicDto(saved.getId(), saved.getName(), saved.getSlug(), saved.getParent() == null ? null : saved.getParent().getId());
    }

    public List<ProblemTemplateDto> listTemplates() {
        return templateRepository.findByDeletedAtIsNullAndActiveTrueOrderByCreatedAtDesc().stream()
                .map(this::toTemplateDto)
                .toList();
    }

    @Transactional
    public ProblemTemplateDto createTemplate(ProblemTemplateDto request) {
        ProblemTemplate template = ProblemTemplate.builder()
                .title(request.title())
                .topicSlug(request.topicSlug())
                .difficulty(request.difficulty())
                .operation(request.operation())
                .questionTemplate(request.questionTemplate())
                .parametersSchema(request.parametersSchema())
                .answerExpression(request.answerExpression())
                .active(Boolean.TRUE.equals(request.active()))
                .build();
        return toTemplateDto(templateRepository.save(template));
    }

    public GeneratedProblemDto generateFromTemplate(Long templateId) {
        ProblemTemplate template = templateRepository.findByIdAndDeletedAtIsNull(templateId)
                .filter(t -> Boolean.TRUE.equals(t.getActive()))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TEMPLATE_NOT_FOUND", "Template not found or inactive"));

        ObjectNode generatedParams = objectMapper.createObjectNode();
        String question = template.getQuestionTemplate();
        JsonNode schema = template.getParametersSchema();

        schema.fields().forEachRemaining(entry -> {
            String key = entry.getKey();
            int min = entry.getValue().path("min").asInt(1);
            int max = entry.getValue().path("max").asInt(10);
            int value = min + random.nextInt(Math.max(1, max - min + 1));
            generatedParams.put(key, value);
        });

        for (Map.Entry<String, JsonNode> entry : iterable(generatedParams.fields())) {
            question = question.replace("{{" + entry.getKey() + "}}", entry.getValue().asText());
        }

        return new GeneratedProblemDto(
                template.getId(),
                question,
                generatedParams,
                template.getAnswerExpression(),
                template.getOperation()
        );
    }

    public boolean validateGeneratedAnswer(GeneratedProblemDto generated, JsonNode candidateAnswer) {
        return mathEngineClient.validateTemplateAnswer(
                generated.operation(),
                generated.answerExpression(),
                generated.parameters(),
                candidateAnswer
        );
    }

        @Transactional
        public GeneratedProblemItemDto generateInteractive(Long userId, InteractiveProblemGenerateRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        GenerationMode mode = parseMode(request.mode());
            ProblemTemplate template = null;
            GeneratedProblemDto generated;
            Difficulty difficulty;
            String sourceModel;
            JsonNode correctAnswer = null;

            if (mode == GenerationMode.AI) {
                JsonNode ai = mathEngineClient.generateAiProblem(request.topicSlug(), request.difficulty(), request.skillLevel());
                ObjectNode paramsNode = objectMapper.createObjectNode();
                JsonNode aiParams = ai.path("parameters");
                if (aiParams.isObject()) {
                    paramsNode.setAll((ObjectNode) aiParams);
                }

                String question = ai.path("questionText").asText(null);
                String answerExpression = ai.path("answerExpression").asText(null);
                String operation = ai.path("operation").asText(null);
                if (question == null || answerExpression == null || operation == null) {
                    throw new ApiException(HttpStatus.BAD_GATEWAY, "AI_GENERATION_INVALID", "AI generation response missing required fields");
                }

                generated = new GeneratedProblemDto(null, question, paramsNode, answerExpression, operation);
                sourceModel = ai.path("sourceModel").asText("gemini");
                String diffRaw = request.difficulty() == null ? "MEDIUM" : request.difficulty();
                difficulty = parseDifficultyOrDefault(diffRaw);
                if (ai.has("correctAnswer")) {
                    correctAnswer = ai.get("correctAnswer");
                }
            } else {
                template = resolveTemplateForInteractive(request);
                generated = generateFromTemplate(template.getId());
                sourceModel = "template";
                difficulty = template.getDifficulty() == null ? Difficulty.MEDIUM : template.getDifficulty();
            }

        GeneratedProblem problem = GeneratedProblem.builder()
            .user(user)
            .template(template)
            .generationMode(mode)
                    .sourceModel(sourceModel)
                    .topicSlug(mode == GenerationMode.AI ? request.topicSlug() : template.getTopicSlug())
            .difficulty(difficulty)
            .difficultyScore(toDifficultyScore(difficulty))
            .questionText(generated.question())
            .paramsJson(generated.parameters())
                    .correctAnswer(correctAnswer)
            .answerExpression(generated.answerExpression())
            .operation(generated.operation())
            .attemptCount(0)
            .correctCount(0)
            .build();

        return toGeneratedItemDto(generatedProblemRepository.save(problem));
        }

        public List<GeneratedProblemItemDto> myGeneratedProblems(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return generatedProblemRepository.findByUserAndDeletedAtIsNullOrderByCreatedAtDesc(user).stream()
            .map(this::toGeneratedItemDto)
            .toList();
        }

        @Transactional
        public GeneratedProblemAttemptResponse submitGeneratedAttempt(Long userId, Long generatedProblemId, GeneratedProblemAttemptRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        GeneratedProblem generatedProblem = generatedProblemRepository.findByIdAndDeletedAtIsNull(generatedProblemId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "GENERATED_PROBLEM_NOT_FOUND", "Generated problem not found"));

        if (!generatedProblem.getUser().getId().equals(userId)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "FORBIDDEN", "Generated problem belongs to another user");
        }

        if (request.answer() == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "ANSWER_REQUIRED", "Answer is required");
        }

        boolean symbolicCorrect = false;
        if (generatedProblem.getAnswerExpression() != null && generatedProblem.getOperation() != null) {
            try {
                symbolicCorrect = mathEngineClient.validateTemplateAnswer(
                    generatedProblem.getOperation(),
                    generatedProblem.getAnswerExpression(),
                    generatedProblem.getParamsJson(),
                    request.answer()
                );
            } catch (ApiException ex) {
                // AI-generated expressions may be non-symbolic; continue with semantic verification.
                symbolicCorrect = false;
            }
        }

        boolean semanticCorrect = false;
        BigDecimal semanticConfidence = BigDecimal.valueOf(0.50);
        String semanticFeedback = "Semantic verification completed";
        if (!symbolicCorrect) {
            JsonNode semantic = mathEngineClient.semanticVerify(
                generatedProblem.getQuestionText(),
                request.answer(),
                generatedProblem.getCorrectAnswer(),
                generatedProblem.getAnswerExpression(),
                generatedProblem.getOperation(),
                generatedProblem.getParamsJson()
            );
            semanticCorrect = semantic.path("correct").asBoolean(false);
            semanticConfidence = BigDecimal.valueOf(semantic.path("confidence").asDouble(0.5));
            semanticFeedback = semantic.path("feedback").asText("Semantic verification completed");
        }

        boolean correct = symbolicCorrect || semanticCorrect;
        String method = symbolicCorrect ? "symbolic" : "semantic";
        BigDecimal confidence = symbolicCorrect ? BigDecimal.valueOf(0.99) : semanticConfidence;
        int xpEarned = correct ? 10 : 0;
        String feedback = correct
            ? "Correct answer"
            : semanticFeedback;
        ErrorType resolvedErrorType = resolveErrorType(request.errorType(), correct, semanticFeedback);

        Integer normalizedTimeSpent = sanitizeTimeSpent(request.timeSpentSeconds());
        Integer normalizedTimeToFirstAction = sanitizeTimeToFirstAction(request.timeToFirstActionSeconds(), normalizedTimeSpent);

        GeneratedProblemAttempt attempt = GeneratedProblemAttempt.builder()
            .user(user)
            .generatedProblem(generatedProblem)
            .answer(request.answer())
            .correct(correct)
            .confidence(confidence)
            .verificationMethod(method)
            .feedback(feedback)
            .xpEarned(xpEarned)
            .timeSpentSeconds(normalizedTimeSpent)
            .timeToFirstActionSeconds(normalizedTimeToFirstAction)
            .hintUsed(Boolean.TRUE.equals(request.hintUsed()))
            .errorType(resolvedErrorType)
            .difficultyAtAttempt(parseDifficultyWithFallback(request.difficultyAtAttempt(), generatedProblem.getDifficulty()))
            .topicSlug(firstNonBlank(request.topicSlug(), generatedProblem.getTopicSlug()))
            .topicPath(firstNonBlank(request.topicPath(), resolveTopicPath(generatedProblem.getTopicSlug())))
            .createdAt(OffsetDateTime.now())
            .build();
        generatedProblemAttemptRepository.save(attempt);

        generatedProblem.setAttemptCount((generatedProblem.getAttemptCount() == null ? 0 : generatedProblem.getAttemptCount()) + 1);
        if (correct) {
            generatedProblem.setCorrectCount((generatedProblem.getCorrectCount() == null ? 0 : generatedProblem.getCorrectCount()) + 1);
        }
        generatedProblemRepository.save(generatedProblem);

        String topicSlug = generatedProblem.getTopicSlug();
        if (topicSlug != null && !topicSlug.isBlank()) {
            bktService.updateSkill(user, topicSlug, correct);
        }

        return new GeneratedProblemAttemptResponse(
            generatedProblem.getId(),
            correct,
            confidence,
            method,
            feedback,
            xpEarned
        );
        }

    @Transactional
    public NextProblemResponse getNextAdaptiveProblem(Long userId, String topicSlug, String mode) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        StudentSkill skill = bktService.getOrCreateSkill(user, topicSlug);
        Difficulty recommended = difficultyFromPKnow(skill.getPKnow());

        GenerationMode genMode = parseMode(mode);
        InteractiveProblemGenerateRequest genRequest = new InteractiveProblemGenerateRequest(
                null, topicSlug, recommended.name(), null, genMode.name()
        );

        GeneratedProblemItemDto generated = generateInteractive(userId, genRequest);

        return new NextProblemResponse(
                generated,
                toSkillDto(skill),
                recommended.name()
        );
    }

    public List<StudentSkillDto> getStudentSkills(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return studentSkillRepository.findByUserOrderByUpdatedAtDesc(user).stream()
            .map(this::toSkillDto)
            .toList();
    }

    public StudentSkillDto getStudentSkill(Long userId, String topicSlug) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        StudentSkill skill = bktService.getOrCreateSkill(user, topicSlug);
        return toSkillDto(skill);
    }

    public LearningFeedbackResponse generateLearningFeedback(Long userId, int windowDays, int topNTopics) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("userId", user.getId());
        payload.put("windowDays", windowDays);
        payload.put("topNTopics", topNTopics);

        JsonNode response = mathEngineClient.post("/api/v1/learning/feedback", payload);
        List<String> focusTopics = response.hasNonNull("focusTopics")
                ? objectMapper.convertValue(response.get("focusTopics"), objectMapper.getTypeFactory().constructCollectionType(List.class, String.class))
                : List.of();
        List<String> strengths = response.hasNonNull("strengths")
                ? objectMapper.convertValue(response.get("strengths"), objectMapper.getTypeFactory().constructCollectionType(List.class, String.class))
                : List.of();
        OffsetDateTime generatedAt;
        try {
            generatedAt = response.hasNonNull("generatedAt")
                    ? OffsetDateTime.parse(response.get("generatedAt").asText())
                    : OffsetDateTime.now();
        } catch (Exception ignored) {
            generatedAt = OffsetDateTime.now();
        }
        return new LearningFeedbackResponse(
                response.path("feedbackText").asText(""),
                focusTopics,
                strengths,
                generatedAt
        );
    }

    private Difficulty difficultyFromPKnow(double pKnow) {
        if (pKnow < 0.4) {
            return Difficulty.EASY;
        } else if (pKnow < 0.7) {
            return Difficulty.MEDIUM;
        } else {
            return Difficulty.HARD;
        }
    }

    private String masteryLabel(double pKnow) {
        if (pKnow < 0.3) return "NOVICE";
        if (pKnow < 0.5) return "BEGINNER";
        if (pKnow < 0.7) return "INTERMEDIATE";
        if (pKnow < 0.9) return "ADVANCED";
        return "MASTERED";
    }

    private StudentSkillDto toSkillDto(StudentSkill skill) {
        return new StudentSkillDto(
                skill.getId(),
                skill.getTopicSlug(),
                skill.getPKnow(),
                skill.getPGuess(),
                skill.getPSlip(),
                skill.getPTransit(),
                skill.getTotalAttempts(),
                skill.getCorrectAttempts(),
                masteryLabel(skill.getPKnow()),
                skill.getUpdatedAt()
        );
    }

    private boolean isCorrect(JsonNode expected, JsonNode actual) {
        return expected != null && actual != null && expected.equals(actual);
    }

    private Set<Topic> resolveTopics(Set<String> topicSlugs) {
        if (topicSlugs == null || topicSlugs.isEmpty()) {
            return new HashSet<>();
        }
        Set<Topic> topics = new HashSet<>();
        for (String slug : topicSlugs) {
            Topic topic = topicRepository.findBySlugAndDeletedAtIsNull(slug)
                    .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "TOPIC_NOT_FOUND", "Unknown topic: " + slug));
            topics.add(topic);
        }
        return topics;
    }

    private ProblemDto toDto(Problem problem) {
        Set<String> topicSlugs = problem.getTopics().stream().map(Topic::getSlug).collect(java.util.stream.Collectors.toSet());
        return new ProblemDto(
                problem.getId(),
                problem.getTitle(),
                problem.getType(),
                problem.getDifficulty(),
                problem.getTopic(),
                problem.getQuestionText(),
                problem.getCorrectAnswer(),
                problem.getHintText(),
                problem.getExplanationText(),
                problem.getXpReward(),
                problem.getFreeOnly(),
                topicSlugs
        );
    }

    private ProblemTemplateDto toTemplateDto(ProblemTemplate template) {
        return new ProblemTemplateDto(
                template.getId(),
                template.getTitle(),
                template.getTopicSlug(),
                template.getDifficulty(),
                template.getOperation(),
                template.getQuestionTemplate(),
                template.getParametersSchema(),
                template.getAnswerExpression(),
                template.getActive()
        );
    }

    private <T> Iterable<T> iterable(java.util.Iterator<T> iterator) {
        return () -> iterator;
    }

    private GeneratedProblemItemDto toGeneratedItemDto(GeneratedProblem problem) {
        return new GeneratedProblemItemDto(
                problem.getId(),
                problem.getTemplate() == null ? null : problem.getTemplate().getId(),
                problem.getGenerationMode(),
                problem.getSourceModel(),
                problem.getTopicSlug(),
                problem.getDifficulty(),
                problem.getDifficultyScore(),
                problem.getQuestionText(),
                problem.getParamsJson(),
                problem.getAttemptCount(),
                problem.getCorrectCount(),
                problem.getCreatedAt()
        );
    }

    private GenerationMode parseMode(String rawMode) {
        if (rawMode == null || rawMode.isBlank()) {
            return GenerationMode.TEMPLATE;
        }
        try {
            return GenerationMode.valueOf(rawMode.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_GENERATION_MODE", "Unknown generation mode: " + rawMode);
        }
    }

    private Difficulty parseDifficultyOrDefault(String rawDifficulty) {
        if (rawDifficulty == null || rawDifficulty.isBlank()) {
            return Difficulty.MEDIUM;
        }
        try {
            return Difficulty.valueOf(rawDifficulty.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DIFFICULTY", "Unknown difficulty: " + rawDifficulty);
        }
    }

    private Difficulty parseDifficultyWithFallback(String rawDifficulty, Difficulty fallback) {
        if (rawDifficulty == null || rawDifficulty.isBlank()) {
            return fallback;
        }
        try {
            return Difficulty.valueOf(rawDifficulty.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return fallback;
        }
    }

    private ErrorType parseErrorType(String rawErrorType) {
        if (rawErrorType == null || rawErrorType.isBlank()) {
            return null;
        }
        try {
            return ErrorType.valueOf(rawErrorType.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            return ErrorType.OTHER;
        }
    }

    private ErrorType resolveErrorType(String rawErrorType, boolean correct, String feedbackText) {
        ErrorType parsed = parseErrorType(rawErrorType);
        if (parsed != null) {
            return parsed;
        }
        if (correct) {
            return null;
        }
        String normalized = feedbackText == null ? "" : feedbackText.toLowerCase(Locale.ROOT);
        if (normalized.contains("sign")) {
            return ErrorType.SIGN_ERROR;
        }
        if (normalized.contains("arith") || normalized.contains("calculate") || normalized.contains("calculation")) {
            return ErrorType.ARITHMETIC_ERROR;
        }
        if (normalized.contains("formula") || normalized.contains("identity")) {
            return ErrorType.FORMULA_ERROR;
        }
        if (normalized.contains("logic") || normalized.contains("reason")) {
            return ErrorType.LOGIC_ERROR;
        }
        return ErrorType.OTHER;
    }

    private String resolveTopicPath(String topicSlug) {
        if (topicSlug == null || topicSlug.isBlank()) {
            return null;
        }
        return topicRepository.findBySlugAndDeletedAtIsNull(topicSlug)
                .map(this::buildTopicPath)
                .orElse(topicSlug);
    }

    private String firstNonBlank(String primary, String fallback) {
        return (primary == null || primary.isBlank()) ? fallback : primary;
    }

    private String buildTopicPath(Topic leaf) {
        List<String> chain = new ArrayList<>();
        Topic cursor = leaf;
        int guard = 0;
        while (cursor != null && guard < 10) {
            chain.add(0, cursor.getSlug());
            cursor = cursor.getParent();
            guard++;
        }
        return String.join(".", chain);
    }

    private Integer sanitizeTimeSpent(Integer raw) {
        if (raw == null) {
            return null;
        }
        if (raw < 0) {
            return 0;
        }
        return Math.min(raw, MAX_TIME_SPENT_SECONDS);
    }

    private Integer sanitizeTimeToFirstAction(Integer rawFirstAction, Integer sanitizedSpent) {
        if (rawFirstAction == null) {
            return null;
        }
        int value = Math.max(0, rawFirstAction);
        if (sanitizedSpent != null && value > sanitizedSpent) {
            value = sanitizedSpent;
        }
        return value;
    }

    private ProblemTemplate resolveTemplateForInteractive(InteractiveProblemGenerateRequest request) {
        if (request.templateId() != null) {
            return templateRepository.findByIdAndDeletedAtIsNull(request.templateId())
                    .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TEMPLATE_NOT_FOUND", "Template not found"));
        }

        List<ProblemTemplate> candidates;
        if (request.topicSlug() != null && !request.topicSlug().isBlank()) {
            candidates = templateRepository.findByDeletedAtIsNullAndActiveTrueAndTopicSlugOrderByCreatedAtDesc(request.topicSlug());
        } else {
            Difficulty difficulty = parseDifficultyOrDefault(request.difficulty());
            candidates = templateRepository.findByDeletedAtIsNullAndActiveTrueAndDifficultyOrderByCreatedAtDesc(difficulty);
            if (candidates.isEmpty()) {
                candidates = templateRepository.findByDeletedAtIsNullAndActiveTrueOrderByCreatedAtDesc();
            }
        }

        if (candidates.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "TEMPLATE_NOT_FOUND", "No active templates available");
        }
        return candidates.get(random.nextInt(candidates.size()));
    }

    private BigDecimal toDifficultyScore(Difficulty difficulty) {
        double score = switch (difficulty) {
            case EASY -> 0.35;
            case MEDIUM -> 0.60;
            case HARD -> 0.85;
        };
        return BigDecimal.valueOf(score).setScale(3, RoundingMode.HALF_UP);
    }

}
