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

import java.time.OffsetDateTime;

@Entity
@Table(name = "calc_history")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalcHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "section", nullable = false, length = 50)
    private String section;

    @Column(name = "operation", nullable = false, length = 100)
    private String operation;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "input_data", nullable = false, columnDefinition = "jsonb")
    private JsonNode inputData;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "output_data", columnDefinition = "jsonb")
    private JsonNode outputData;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;
}
