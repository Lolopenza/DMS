package com.dmc.common.security;

import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class CookieService {

    public static final String ACCESS_COOKIE = "dmc_access_token";
    public static final String REFRESH_COOKIE = "dmc_refresh_token";

    private final JwtProperties jwtProperties;

    public CookieService(JwtProperties jwtProperties) {
        this.jwtProperties = jwtProperties;
    }

    public void writeAuthCookies(HttpServletResponse response, String accessToken, String refreshToken) {
        response.addHeader("Set-Cookie", buildCookie(ACCESS_COOKIE, accessToken, jwtProperties.getAccessTokenTtlSeconds()).toString());
        response.addHeader("Set-Cookie", buildCookie(REFRESH_COOKIE, refreshToken, jwtProperties.getRefreshTokenTtlSeconds()).toString());
    }

    public void clearAuthCookies(HttpServletResponse response) {
        response.addHeader("Set-Cookie", buildCookie(ACCESS_COOKIE, "", 0).toString());
        response.addHeader("Set-Cookie", buildCookie(REFRESH_COOKIE, "", 0).toString());
    }

    private ResponseCookie buildCookie(String name, String value, long maxAgeSeconds) {
        ResponseCookie.ResponseCookieBuilder builder = ResponseCookie.from(name, value)
                .path("/")
                .httpOnly(true)
                .secure(jwtProperties.isCookieSecure())
                .sameSite(jwtProperties.getCookieSameSite())
                .maxAge(Duration.ofSeconds(Math.max(maxAgeSeconds, 0)));

        if (jwtProperties.getCookieDomain() != null && !jwtProperties.getCookieDomain().isBlank()) {
            builder.domain(jwtProperties.getCookieDomain());
        }

        return builder.build();
    }
}
