package com.dmc.problem.entity;

import com.dmc.user.entity.User;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
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

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "generated_problem_attempts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GeneratedProblemAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "generated_problem_id", nullable = false)
    private GeneratedProblem generatedProblem;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "answer", nullable = false, columnDefinition = "jsonb")
    private JsonNode answer;

    @Column(name = "correct", nullable = false)
    private Boolean correct;

    @Column(name = "confidence", precision = 4, scale = 3)
    private BigDecimal confidence;

    @Column(name = "verification_method", nullable = false, length = 32)
    private String verificationMethod;

    @Column(name = "feedback")
    private String feedback;

    @Column(name = "xp_earned", nullable = false)
    private Integer xpEarned;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
