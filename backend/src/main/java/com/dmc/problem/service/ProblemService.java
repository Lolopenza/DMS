package com.dmc.problem.service;

import com.dmc.common.exception.ApiException;
import com.dmc.infrastructure.mathengine.MathEngineClient;
import com.dmc.problem.dto.GeneratedProblemDto;
import com.dmc.problem.dto.ProblemAttemptRequest;
import com.dmc.problem.dto.ProblemAttemptResponse;
import com.dmc.problem.dto.ProblemDto;
import com.dmc.problem.dto.ProblemTemplateDto;
import com.dmc.problem.dto.TopicDto;
import com.dmc.problem.entity.Problem;
import com.dmc.problem.entity.ProblemAttempt;
import com.dmc.problem.entity.ProblemTemplate;
import com.dmc.problem.entity.Topic;
import com.dmc.problem.repository.ProblemAttemptRepository;
import com.dmc.problem.repository.ProblemRepository;
import com.dmc.problem.repository.ProblemTemplateRepository;
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
import java.util.HashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Random;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class ProblemService {

    private final ProblemRepository problemRepository;
    private final ProblemAttemptRepository problemAttemptRepository;
    private final TopicRepository topicRepository;
    private final ProblemTemplateRepository templateRepository;
    private final UserRepository userRepository;
    private final MathEngineClient mathEngineClient;
    private final ObjectMapper objectMapper;

    private final Random random = new Random();

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

        ProblemAttempt attempt = ProblemAttempt.builder()
                .user(user)
                .problem(problem)
                .answer(request.answer())
                .correct(correct)
                .xpEarned(xp)
                .createdAt(OffsetDateTime.now())
                .build();
        problemAttemptRepository.save(attempt);

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
        ProblemTemplate template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "TEMPLATE_NOT_FOUND", "Template not found"));

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
}
