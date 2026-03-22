package com.dmc.auth.controller;

import com.dmc.auth.dto.AuthResponse;
import com.dmc.auth.dto.LoginRequest;
import com.dmc.auth.dto.MessageResponse;
import com.dmc.auth.dto.PasswordResetConfirmDto;
import com.dmc.auth.dto.PasswordResetRequestDto;
import com.dmc.auth.dto.RegisterRequest;
import com.dmc.auth.dto.SessionResponse;
import com.dmc.auth.dto.UserResponse;
import com.dmc.auth.service.AuthService;
import com.dmc.auth.service.RequestMetadata;
import com.dmc.common.exception.ApiException;
import com.dmc.common.security.CookieService;
import com.dmc.common.security.JwtService;
import com.dmc.common.security.UserPrincipal;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final CookieService cookieService;
    private final JwtService jwtService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request,
                                                 HttpServletRequest httpRequest,
                                                 HttpServletResponse httpResponse) {
        AuthService.AuthResult result = authService.register(request, requestMetadata(httpRequest));
        cookieService.writeAuthCookies(httpResponse, result.response().accessToken(), result.refreshToken());
        return ResponseEntity.status(HttpStatus.CREATED).body(result.response());
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request,
                                              HttpServletRequest httpRequest,
                                              HttpServletResponse httpResponse) {
        AuthService.AuthResult result = authService.login(request, requestMetadata(httpRequest));
        cookieService.writeAuthCookies(httpResponse, result.response().accessToken(), result.refreshToken());
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refresh(HttpServletRequest httpRequest,
                                                HttpServletResponse httpResponse) {
        String refresh = getCookieValue(httpRequest, CookieService.REFRESH_COOKIE);
        AuthService.AuthResult result = authService.refresh(refresh);
        cookieService.writeAuthCookies(httpResponse, result.response().accessToken(), result.refreshToken());
        return ResponseEntity.ok(result.response());
    }

    @PostMapping("/logout")
    public ResponseEntity<MessageResponse> logout(HttpServletRequest request, HttpServletResponse response) {
        String sessionId = extractSessionIdFromAccessCookie(request);
        authService.logoutCurrentSession(sessionId);
        cookieService.clearAuthCookies(response);
        return ResponseEntity.ok(new MessageResponse("Logged out"));
    }

    @PostMapping("/logout-all")
    public ResponseEntity<MessageResponse> logoutAll(HttpServletResponse response) {
        authService.logoutAll(currentUserId());
        cookieService.clearAuthCookies(response);
        return ResponseEntity.ok(new MessageResponse("Logged out from all sessions"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserResponse> me() {
        return ResponseEntity.ok(authService.me(currentUserId()));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<SessionResponse>> sessions() {
        return ResponseEntity.ok(authService.activeSessions(currentUserId()));
    }

    @PostMapping("/sessions/{sessionId}/revoke")
    public ResponseEntity<MessageResponse> revokeSession(@PathVariable String sessionId) {
        authService.revokeSession(currentUserId(), sessionId);
        return ResponseEntity.ok(new MessageResponse("Session revoked"));
    }

    @PostMapping("/password/reset-request")
    public ResponseEntity<MessageResponse> resetRequest(@Valid @RequestBody PasswordResetRequestDto request) {
        authService.requestPasswordReset(request.email());
        return ResponseEntity.ok(new MessageResponse("If an account exists, reset instructions have been sent"));
    }

    @PostMapping("/password/reset-confirm")
    public ResponseEntity<MessageResponse> resetConfirm(@Valid @RequestBody PasswordResetConfirmDto request) {
        authService.confirmPasswordReset(request);
        return ResponseEntity.ok(new MessageResponse("Password updated"));
    }

    private RequestMetadata requestMetadata(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        String ip = (xff != null && !xff.isBlank()) ? xff.split(",")[0].trim() : request.getRemoteAddr();
        String userAgent = request.getHeader("User-Agent");
        return new RequestMetadata(ip, userAgent == null ? "unknown" : userAgent);
    }

    private String getCookieValue(HttpServletRequest request, String key) {
        Cookie[] cookies = request.getCookies();
        if (cookies == null) {
            return null;
        }
        return Arrays.stream(cookies)
                .filter(c -> key.equals(c.getName()))
                .map(Cookie::getValue)
                .findFirst()
                .orElse(null);
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
        }
        return principal.getId();
    }

    private String extractSessionIdFromAccessCookie(HttpServletRequest request) {
        String token = getCookieValue(request, CookieService.ACCESS_COOKIE);
        if (token == null || token.isBlank()) {
            return null;
        }
        try {
            return jwtService.parse(token).get("sessionId", String.class);
        } catch (Exception ignored) {
            return null;
        }
    }
}
