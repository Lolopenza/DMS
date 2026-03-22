package com.dmc.auth.dto;

import java.time.OffsetDateTime;

public record SessionResponse(
        String sessionId,
        String ipAddress,
        String userAgent,
        OffsetDateTime lastActivity,
        OffsetDateTime expiresAt,
        boolean revoked
) {
}
