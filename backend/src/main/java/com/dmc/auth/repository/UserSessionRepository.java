package com.dmc.auth.repository;

import com.dmc.auth.entity.UserSession;
import com.dmc.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface UserSessionRepository extends JpaRepository<UserSession, Long> {
    Optional<UserSession> findBySessionId(String sessionId);
    Optional<UserSession> findBySessionIdAndUser(String sessionId, User user);
    List<UserSession> findByUserAndRevokedFalse(User user);

    @Modifying
    @Query("update UserSession us set us.revoked = true where us.sessionId = :sessionId")
    int revokeBySessionId(@Param("sessionId") String sessionId);

    @Modifying
    @Query("update UserSession us set us.revoked = true where us.user = :user and us.revoked = false")
    int revokeAllByUser(@Param("user") User user);
}
