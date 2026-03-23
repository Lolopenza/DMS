package com.dmc.problem.entity;

import com.dmc.common.entity.BaseEntity;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "problems")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class Problem extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "type", nullable = false, columnDefinition = "problem_type")
    private ProblemType type;

    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    @Column(name = "difficulty", nullable = false, columnDefinition = "difficulty")
    private Difficulty difficulty;

    @Column(name = "topic", length = 100)
    private String topic;

    @Column(name = "question_text", nullable = false)
    private String questionText;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "correct_answer", nullable = false, columnDefinition = "jsonb")
    private JsonNode correctAnswer;

    @Column(name = "hint_text")
    private String hintText;

    @Column(name = "explanation_text")
    private String explanationText;

    @Column(name = "xp_reward", nullable = false)
    private Integer xpReward;

    @Column(name = "free_only", nullable = false)
    private Boolean freeOnly;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "problem_topics",
            joinColumns = @JoinColumn(name = "problem_id"),
            inverseJoinColumns = @JoinColumn(name = "topic_id")
    )
    private Set<Topic> topics = new HashSet<>();
}
