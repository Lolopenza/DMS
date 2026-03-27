package com.dmc.admin.dto;

import java.time.OffsetDateTime;

public record AdminUserItemDto(
        Long id,
        String email,
        String username,
        String role,
        boolean enabled,
        OffsetDateTime createdAt
) {
}

