package com.dmc.common.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.time.OffsetDateTime;
import java.util.Date;
import java.util.Map;

@Service
public class JwtService {

    private final JwtProperties properties;
    private final Key signingKey;

    public JwtService(JwtProperties properties) {
        this.properties = properties;
        this.signingKey = Keys.hmacShaKeyFor(properties.getKey().getBytes(StandardCharsets.UTF_8));
    }

    public String generateAccessToken(Long userId, String email, String role, String sessionId) {
        return generateToken(userId, email, role, sessionId, properties.getAccessTokenTtlSeconds(), "access");
    }

    public String generateRefreshToken(Long userId, String email, String role, String sessionId) {
        return generateToken(userId, email, role, sessionId, properties.getRefreshTokenTtlSeconds(), "refresh");
    }

    public Claims parse(String token) {
        return Jwts.parser()
                .verifyWith((javax.crypto.SecretKey) signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public boolean isAccessToken(String token) {
        return "access".equals(parse(token).get("tokenType", String.class));
    }

    public boolean isRefreshToken(String token) {
        return "refresh".equals(parse(token).get("tokenType", String.class));
    }

    private String generateToken(Long userId, String email, String role, String sessionId, long ttlSeconds, String tokenType) {
        OffsetDateTime now = OffsetDateTime.now();
        OffsetDateTime exp = now.plusSeconds(ttlSeconds);

        return Jwts.builder()
                .issuer(properties.getIssuer())
                .subject(String.valueOf(userId))
                .issuedAt(Date.from(now.toInstant()))
                .expiration(Date.from(exp.toInstant()))
                .claims(Map.of(
                        "email", email,
                        "role", role,
                        "sessionId", sessionId,
                        "tokenType", tokenType
                ))
                .signWith(signingKey)
                .compact();
    }
}
