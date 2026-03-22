package com.dmc.auth.dto;

public record AuthResponse(
        UserResponse user,
        String accessToken,
        String sessionId
) {
}
