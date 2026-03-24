package com.dmc.problem.entity;

import com.dmc.common.entity.BaseEntity;
import com.dmc.user.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

import java.math.BigDecimal;

@Entity
@Table(name = "generated_problems")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class GeneratedProblem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "template_id")
    private ProblemTemplate template;

    @Enumerated(EnumType.STRING)
    @Column(name = "generation_mode", nullable = false, length = 20)
    private GenerationMode generationMode;

    @Column(name = "source_model", length = 80)
    private String sourceModel;

    @Column(name = "topic_slug", length = 120)
    private String topicSlug;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "difficulty", nullable = false, columnDefinition = "difficulty")
    private Difficulty difficulty;

    @Column(name = "difficulty_score", nullable = false, precision = 4, scale = 3)
    private BigDecimal difficultyScore;

    @Column(name = "question_text", nullable = false)
    private String questionText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "params_json", nullable = false, columnDefinition = "jsonb")
    private JsonNode paramsJson;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "correct_answer", columnDefinition = "jsonb")
    private JsonNode correctAnswer;

    @Column(name = "answer_expression")
    private String answerExpression;

    @Column(name = "operation", length = 100)
    private String operation;

    @Column(name = "attempt_count", nullable = false)
    private Integer attemptCount;

    @Column(name = "correct_count", nullable = false)
    private Integer correctCount;
}
