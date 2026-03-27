package com.dmc.admin.dto;

import java.util.List;

public record AdminUserListResponse(
        List<AdminUserItemDto> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}

