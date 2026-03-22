package com.dmc.auth;

import com.dmc.auth.dto.LoginRequest;
import com.dmc.auth.dto.PasswordResetConfirmDto;
import com.dmc.auth.dto.PasswordResetRequestDto;
import com.dmc.auth.dto.RegisterRequest;
import com.dmc.auth.entity.PasswordResetToken;
import com.dmc.auth.repository.PasswordResetTokenRepository;
import com.dmc.auth.service.TokenHashService;
import com.dmc.support.AbstractPostgresIntegrationTest;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockCookie;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.time.OffsetDateTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AuthFlowIntegrationTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetTokenRepository passwordResetTokenRepository;

    @Autowired
    private TokenHashService tokenHashService;

    @Test
    void registerMeLogoutFlowWorks() throws Exception {
        RegisterRequest request = new RegisterRequest("integration-user", "integration.user@example.com", "StrongPass123");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.email").value("integration.user@example.com"))
                .andReturn();

        MockCookie accessCookie = cookie(registerResult, "dmc_access_token");
        MockCookie refreshCookie = cookie(registerResult, "dmc_refresh_token");

        mockMvc.perform(get("/api/auth/me")
                        .cookie(accessCookie, refreshCookie))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("integration.user@example.com"));

        mockMvc.perform(post("/api/auth/logout")
                        .cookie(accessCookie, refreshCookie))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/auth/me")
                        .cookie(accessCookie, refreshCookie))
                .andExpect(status().isForbidden());
    }

    @Test
    void refreshRotatesRefreshToken() throws Exception {
        RegisterRequest register = new RegisterRequest("refresh-user", "refresh.user@example.com", "StrongPass123");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        MockCookie firstRefresh = cookie(registerResult, "dmc_refresh_token");

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(firstRefresh))
                .andExpect(status().isOk())
                .andReturn();

        MockCookie secondRefresh = cookie(refreshResult, "dmc_refresh_token");
        assertThat(secondRefresh.getValue()).isNotEqualTo(firstRefresh.getValue());
    }

    @Test
    void refreshTokenReplayRevokesSessionFamily() throws Exception {
        RegisterRequest register = new RegisterRequest("replay-user", "replay.user@example.com", "StrongPass123");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        MockCookie firstRefresh = cookie(registerResult, "dmc_refresh_token");

        MvcResult refreshResult = mockMvc.perform(post("/api/auth/refresh")
                        .cookie(firstRefresh))
                .andExpect(status().isOk())
                .andReturn();

        MockCookie secondRefresh = cookie(refreshResult, "dmc_refresh_token");

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(firstRefresh))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.error.code").value("REFRESH_TOKEN_REUSE_DETECTED"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(secondRefresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void revokeSingleSessionInvalidatesItsRefreshToken() throws Exception {
        RegisterRequest register = new RegisterRequest("session-user", "session.user@example.com", "StrongPass123");

        MvcResult registerResult = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated())
                .andReturn();

        MockCookie access = cookie(registerResult, "dmc_access_token");
        MockCookie refresh = cookie(registerResult, "dmc_refresh_token");

        MvcResult sessionsResult = mockMvc.perform(get("/api/auth/sessions")
                        .cookie(access, refresh))
                .andExpect(status().isOk())
                .andReturn();

        JsonNode sessions = objectMapper.readTree(sessionsResult.getResponse().getContentAsString());
        String sessionId = sessions.get(0).get("sessionId").asText();

        mockMvc.perform(post("/api/auth/sessions/{sessionId}/revoke", sessionId)
                        .cookie(access, refresh))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.message").value("Session revoked"));

        mockMvc.perform(post("/api/auth/refresh")
                        .cookie(refresh))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void passwordResetConfirmAllowsNewPasswordAndRevokesOldCredentials() throws Exception {
        RegisterRequest register = new RegisterRequest("reset-user", "reset.user@example.com", "StrongPass123");

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(register)))
                .andExpect(status().isCreated());

        User user = userRepository.findByEmail("reset.user@example.com").orElseThrow();
        String rawToken = UUID.randomUUID() + "." + UUID.randomUUID();

        passwordResetTokenRepository.save(PasswordResetToken.builder()
                .user(user)
                .token(tokenHashService.sha256(rawToken))
                .createdAt(OffsetDateTime.now())
                .expiresAt(OffsetDateTime.now().plusMinutes(10))
                .build());

        mockMvc.perform(post("/api/auth/password/reset-request")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetRequestDto("reset.user@example.com"))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/password/reset-confirm")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new PasswordResetConfirmDto(rawToken, "NewStrongPass123"))))
                .andExpect(status().isOk());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("reset.user@example.com", "StrongPass123"))))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(new LoginRequest("reset.user@example.com", "NewStrongPass123"))))
                .andExpect(status().isOk());
    }

    private MockCookie cookie(MvcResult result, String name) {
                jakarta.servlet.http.Cookie[] cookies = result.getResponse().getCookies();
                for (jakarta.servlet.http.Cookie cookie : cookies) {
            if (name.equals(cookie.getName())) {
                return new MockCookie(cookie.getName(), cookie.getValue());
            }
        }
        throw new AssertionError("Cookie not found: " + name);
    }
}
