package com.dmc.auth.repository;

import com.dmc.auth.entity.RefreshToken;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUserAndRevokedFalse(User user);

    @Modifying
    @Query("update RefreshToken rt set rt.revoked = true, rt.revokedAt = :now where rt.sessionId = :sessionId and rt.revoked = false")
    int revokeBySessionId(@Param("sessionId") String sessionId, @Param("now") OffsetDateTime now);

    @Modifying
    @Query("update RefreshToken rt set rt.revoked = true, rt.revokedAt = :now where rt.user = :user and rt.revoked = false")
    int revokeAllByUser(@Param("user") User user, @Param("now") OffsetDateTime now);
}
