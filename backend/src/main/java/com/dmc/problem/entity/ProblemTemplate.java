package com.dmc.problem.entity;

import com.dmc.common.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.SQLRestriction;
import org.hibernate.type.SqlTypes;

@Entity
@Table(name = "problem_templates")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class ProblemTemplate extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "topic_slug", length = 120)
    private String topicSlug;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "difficulty", nullable = false, columnDefinition = "difficulty")
    private Difficulty difficulty;

    @Column(name = "operation", nullable = false, length = 100)
    private String operation;

    @Column(name = "question_template", nullable = false)
    private String questionTemplate;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "parameters_schema", nullable = false, columnDefinition = "jsonb")
    private JsonNode parametersSchema;

    @Column(name = "answer_expression", nullable = false)
    private String answerExpression;

    @Column(name = "active", nullable = false)
    private Boolean active;
}
