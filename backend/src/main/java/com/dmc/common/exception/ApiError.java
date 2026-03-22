package com.dmc.common.exception;

import java.time.OffsetDateTime;
import java.util.Map;

public record ApiError(
        String code,
        String message,
        Map<String, Object> details,
        OffsetDateTime timestamp
) {
}
