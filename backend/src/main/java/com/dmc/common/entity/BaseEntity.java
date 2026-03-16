package com.dmc.common.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.OffsetDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@MappedSuperclass
public abstract class BaseEntity {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false, columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime updatedAt;

    @Column(name= "deleted_at", columnDefinition = "TIMESTAMP WITH TIME ZONE")
    private OffsetDateTime deletedAt;
}
