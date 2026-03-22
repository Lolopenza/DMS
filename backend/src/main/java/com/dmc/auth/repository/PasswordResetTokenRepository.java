package com.dmc.auth.repository;

import com.dmc.auth.entity.PasswordResetToken;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface PasswordResetTokenRepository extends JpaRepository<PasswordResetToken, Long> {
    Optional<PasswordResetToken> findByToken(String token);

    @Modifying
    @Query("update PasswordResetToken prt set prt.usedAt = CURRENT_TIMESTAMP where prt.user = :user and prt.usedAt is null")
    int markAllUsedByUser(@Param("user") User user);
}
