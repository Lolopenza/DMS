package com.dmc.problem.entity;

import com.dmc.user.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;

@Entity
@Table(name = "problem_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ProblemAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "problem_id", nullable = false)
    private Problem problem;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answer", nullable = false, columnDefinition = "jsonb")
    private JsonNode answer;

    @Column(name = "correct", nullable = false)
    private Boolean correct;

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "time_to_first_action_seconds")
    private Integer timeToFirstActionSeconds;

    @Column(name = "hint_used", nullable = false)
    private Boolean hintUsed;

    @Enumerated(EnumType.STRING)
    @Column(name = "error_type", length = 32)
    private ErrorType errorType;

    @Enumerated(EnumType.STRING)
    @Column(name = "difficulty_at_attempt", length = 16)
    private Difficulty difficultyAtAttempt;

    @Column(name = "topic_slug", length = 120)
    private String topicSlug;

    @Column(name = "topic_path", length = 255)
    private String topicPath;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
