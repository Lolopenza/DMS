package com.dmc.auth;

import com.dmc.common.security.JwtProperties;
import com.dmc.common.security.JwtService;
import io.jsonwebtoken.Claims;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class JwtServiceUnitTest {

    @Test
    void generatesAndParsesAccessTokenWithExpectedClaims() {
        JwtProperties props = new JwtProperties();
        props.setIssuer("dmc-backend-test");
        props.setAccessTokenTtlSeconds(900);
        props.setRefreshTokenTtlSeconds(604800);
        props.setKey("test-jwt-secret-key-with-at-least-64-characters-for-hs384-signing!");

        JwtService jwtService = new JwtService(props);

        String token = jwtService.generateAccessToken(42L, "user@example.com", "STUDENT", "session-1");
        Claims claims = jwtService.parse(token);

        assertThat(jwtService.isAccessToken(token)).isTrue();
        assertThat(jwtService.isRefreshToken(token)).isFalse();
        assertThat(claims.getSubject()).isEqualTo("42");
        assertThat(claims.get("email", String.class)).isEqualTo("user@example.com");
        assertThat(claims.get("role", String.class)).isEqualTo("STUDENT");
        assertThat(claims.get("sessionId", String.class)).isEqualTo("session-1");
    }

    @Test
    void generatesRefreshTokenTypeCorrectly() {
        JwtProperties props = new JwtProperties();
        props.setIssuer("dmc-backend-test");
        props.setAccessTokenTtlSeconds(900);
        props.setRefreshTokenTtlSeconds(604800);
        props.setKey("test-jwt-secret-key-with-at-least-64-characters-for-hs384-signing!");

        JwtService jwtService = new JwtService(props);

        String token = jwtService.generateRefreshToken(7L, "u@example.com", "ADMIN", "session-2");

        assertThat(jwtService.isRefreshToken(token)).isTrue();
        assertThat(jwtService.isAccessToken(token)).isFalse();
    }
}
