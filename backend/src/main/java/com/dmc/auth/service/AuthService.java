package com.dmc.auth.service;

import com.dmc.auth.config.AuthProperties;
import com.dmc.auth.dto.AuthResponse;
import com.dmc.auth.dto.LoginRequest;
import com.dmc.auth.dto.PasswordResetConfirmDto;
import com.dmc.auth.dto.RegisterRequest;
import com.dmc.auth.dto.SessionResponse;
import com.dmc.auth.dto.UserResponse;
import com.dmc.auth.entity.PasswordResetToken;
import com.dmc.auth.entity.RefreshToken;
import com.dmc.auth.entity.UserSession;
import com.dmc.auth.repository.PasswordResetTokenRepository;
import com.dmc.auth.repository.RefreshTokenRepository;
import com.dmc.auth.repository.UserSessionRepository;
import com.dmc.common.exception.ApiException;
import com.dmc.common.security.JwtProperties;
import com.dmc.common.security.JwtService;
import com.dmc.user.entity.User;
import com.dmc.user.entity.UserRole;
import com.dmc.user.repository.UserRepository;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.extern.slf4j.Slf4j;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthService {

    private final UserRepository userRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final UserSessionRepository userSessionRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final JwtProperties jwtProperties;
    private final AuthProperties authProperties;
    private final TokenHashService tokenHashService;
    private final EmailService emailService;

    @Transactional
    public AuthResult register(RegisterRequest request, RequestMetadata metadata) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        String username = request.name().trim();

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "EMAIL_TAKEN", "Email is already registered");
        }

        if (userRepository.existsByUsername(username)) {
            throw new ApiException(HttpStatus.CONFLICT, "USERNAME_TAKEN", "Username is already taken");
        }

        User user = User.builder()
                .email(email)
                .username(username)
                .password(passwordEncoder.encode(request.password()))
                .role(UserRole.STUDENT)
                .enabled(true)
                .build();

        User saved = userRepository.save(user);
        return issueTokens(saved, metadata);
    }

    @Transactional
    public AuthResult login(LoginRequest request, RequestMetadata metadata) {
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password"));

        OffsetDateTime now = OffsetDateTime.now();
        if (user.getLockedUntil() != null && user.getLockedUntil().isAfter(now)) {
            throw new ApiException(HttpStatus.TOO_MANY_REQUESTS, "ACCOUNT_LOCKED", "Account is temporarily locked");
        }

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            int attempts = (user.getFailedLoginAttempts() == null ? 0 : user.getFailedLoginAttempts()) + 1;
            user.setFailedLoginAttempts(attempts);

            if (attempts >= authProperties.getLockoutThreshold()) {
                user.setLockedUntil(now.plusMinutes(authProperties.getLockoutMinutes()));
                user.setFailedLoginAttempts(0);
            }

            userRepository.save(user);
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "Invalid email or password");
        }

        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        return issueTokens(user, metadata);
    }

    @Transactional
    public AuthResult refresh(String rawRefreshToken) {
        if (rawRefreshToken == null || rawRefreshToken.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "MISSING_REFRESH_TOKEN", "Refresh token is required");
        }

        Claims claims = jwtService.parse(rawRefreshToken);
        if (!jwtService.isRefreshToken(rawRefreshToken)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_TOKEN_TYPE", "Expected refresh token");
        }

        String hashed = tokenHashService.sha256(rawRefreshToken);
        RefreshToken stored = refreshTokenRepository.findByToken(hashed)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "Refresh token not recognized"));

        OffsetDateTime now = OffsetDateTime.now();
        if (Boolean.TRUE.equals(stored.getRevoked())) {
            // Reuse of an already-rotated refresh token indicates possible theft/replay.
            // As a defensive measure, revoke all active sessions for this user.
            User compromisedUser = stored.getUser();
            refreshTokenRepository.revokeAllByUser(compromisedUser, now);
            userSessionRepository.revokeAllByUser(compromisedUser);
            log.warn("Refresh token replay detected for userId={} sessionId={}", compromisedUser.getId(), stored.getSessionId());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_REUSE_DETECTED", "Refresh token is no longer valid");
        }

        if (stored.getExpiresAt().isBefore(now)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "REFRESH_TOKEN_REVOKED", "Refresh token is no longer valid");
        }

        User user = stored.getUser();
        String sessionId = claims.get("sessionId", String.class);

        stored.setRevoked(true);
        stored.setRevokedAt(now);
        refreshTokenRepository.save(stored);

        UserSession session = userSessionRepository.findBySessionId(sessionId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_NOT_FOUND", "Session is no longer active"));

        if (Boolean.TRUE.equals(session.getRevoked()) || session.getExpiresAt().isBefore(now)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "SESSION_REVOKED", "Session has expired or been revoked");
        }

        session.setLastActivity(now);
        userSessionRepository.save(session);

        return issueTokens(user, new RequestMetadata(stored.getIpAddress(), stored.getUserAgent()), sessionId);
    }

    @Transactional
    public void logoutCurrentSession(String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return;
        }
        refreshTokenRepository.revokeBySessionId(sessionId, OffsetDateTime.now());
        userSessionRepository.revokeBySessionId(sessionId);
    }

    @Transactional
    public void logoutAll(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        refreshTokenRepository.revokeAllByUser(user, OffsetDateTime.now());
        userSessionRepository.revokeAllByUser(user);
    }

    @Transactional
    public void revokeSession(Long userId, String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_SESSION_ID", "Session id is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

        UserSession session = userSessionRepository.findBySessionIdAndUser(sessionId, user)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "SESSION_NOT_FOUND", "Session not found"));

        refreshTokenRepository.revokeBySessionId(session.getSessionId(), OffsetDateTime.now());
        userSessionRepository.revokeBySessionId(session.getSessionId());
    }

    @Transactional
    public void requestPasswordReset(String email) {
        User user = userRepository.findByEmail(email.trim().toLowerCase(Locale.ROOT)).orElse(null);
        if (user == null) {
            return;
        }

        String raw = UUID.randomUUID() + "." + UUID.randomUUID();
        String hashed = tokenHashService.sha256(raw);
        OffsetDateTime now = OffsetDateTime.now();

        passwordResetTokenRepository.markAllUsedByUser(user);

        PasswordResetToken token = PasswordResetToken.builder()
                .user(user)
                .token(hashed)
                .createdAt(now)
            .expiresAt(now.plusMinutes(authProperties.getPasswordResetTtlMinutes()))
                .build();
        passwordResetTokenRepository.save(token);

        emailService.sendPasswordResetEmail(user.getEmail(), raw);
    }

    @Transactional
    public void confirmPasswordReset(PasswordResetConfirmDto request) {
        String hashed = tokenHashService.sha256(request.token());
        PasswordResetToken token = passwordResetTokenRepository.findByToken(hashed)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "INVALID_RESET_TOKEN", "Reset token is invalid"));

        OffsetDateTime now = OffsetDateTime.now();
        if (token.getUsedAt() != null || token.getExpiresAt().isBefore(now)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "EXPIRED_RESET_TOKEN", "Reset token is expired or already used");
        }

        User user = token.getUser();
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setFailedLoginAttempts(0);
        user.setLockedUntil(null);
        userRepository.save(user);

        token.setUsedAt(now);
        passwordResetTokenRepository.save(token);

        refreshTokenRepository.revokeAllByUser(user, now);
        userSessionRepository.revokeAllByUser(user);
    }

    public UserResponse me(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return toUserResponse(user);
    }

    public List<SessionResponse> activeSessions(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        return userSessionRepository.findByUserAndRevokedFalse(user).stream()
                .map(s -> new SessionResponse(
                        s.getSessionId(),
                        s.getIpAddress(),
                        s.getUserAgent(),
                        s.getLastActivity(),
                        s.getExpiresAt(),
                        Boolean.TRUE.equals(s.getRevoked())
                ))
                .toList();
    }

    private AuthResult issueTokens(User user, RequestMetadata metadata) {
        return issueTokens(user, metadata, UUID.randomUUID().toString());
    }

    private AuthResult issueTokens(User user, RequestMetadata metadata, String sessionId) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime refreshExpiry = now.plusSeconds(jwtProperties.getRefreshTokenTtlSeconds());

        UserSession session = userSessionRepository.findBySessionId(sessionId)
                .orElseGet(() -> UserSession.builder()
                        .sessionId(sessionId)
                        .user(user)
                        .ipAddress(metadata.ipAddress())
                        .userAgent(metadata.userAgent())
                        .createdAt(now)
                        .build());

        session.setLastActivity(now);
        session.setExpiresAt(refreshExpiry);
        session.setRevoked(false);
        userSessionRepository.save(session);

        String accessToken = jwtService.generateAccessToken(user.getId(), user.getEmail(), user.getRole().name(), sessionId);
        String refreshTokenRaw = jwtService.generateRefreshToken(user.getId(), user.getEmail(), user.getRole().name(), sessionId);

        RefreshToken refreshToken = RefreshToken.builder()
                .user(user)
                .token(tokenHashService.sha256(refreshTokenRaw))
                .ipAddress(metadata.ipAddress())
                .userAgent(metadata.userAgent())
                .sessionId(sessionId)
                .createdAt(now)
                .expiresAt(refreshExpiry)
                .revoked(false)
                .build();
        refreshTokenRepository.save(refreshToken);

        AuthResponse response = new AuthResponse(toUserResponse(user), accessToken, sessionId);
        return new AuthResult(response, refreshTokenRaw);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole().name(),
                Boolean.TRUE.equals(user.getEnabled())
        );
    }

    public record AuthResult(AuthResponse response, String refreshToken) {
    }
}
