package com.dmc.user.entity;

import com.dmc.common.entity.BaseEntity;
import jakarta.persistence.Entity;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.experimental.SuperBuilder;


@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@SuperBuilder
@MappedSuperclass
@Table(name = "")
public class User extends BaseEntity {


}
