package com.dmc.problem.entity;

import com.dmc.common.entity.BaseEntity;
import com.dmc.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.SQLRestriction;

@Entity
@Table(name = "student_skills")
@SQLRestriction("deleted_at IS NULL")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
public class StudentSkill extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "topic_slug", nullable = false, length = 120)
    private String topicSlug;

    @Column(name = "p_know", nullable = false)
    @Builder.Default
    private Double pKnow = 0.25;

    @Column(name = "p_guess", nullable = false)
    @Builder.Default
    private Double pGuess = 0.20;

    @Column(name = "p_slip", nullable = false)
    @Builder.Default
    private Double pSlip = 0.10;

    @Column(name = "p_transit", nullable = false)
    @Builder.Default
    private Double pTransit = 0.10;

    @Column(name = "total_attempts", nullable = false)
    @Builder.Default
    private Integer totalAttempts = 0;

    @Column(name = "correct_attempts", nullable = false)
    @Builder.Default
    private Integer correctAttempts = 0;
}
