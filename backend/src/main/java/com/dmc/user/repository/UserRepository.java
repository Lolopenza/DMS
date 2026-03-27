package com.dmc.user.repository;

import com.dmc.user.entity.User;
import com.dmc.user.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    boolean existsByEmail(String email);
    boolean existsByUsername(String username);

    long countByRole(UserRole role);

    long countByRoleAndLastActive(UserRole role, LocalDate lastActive);

    List<User> findByRoleOrderByIdAsc(UserRole role);
}
