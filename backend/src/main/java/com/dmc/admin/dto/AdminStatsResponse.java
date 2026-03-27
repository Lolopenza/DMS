package com.dmc.admin.dto;

public record AdminStatsResponse(
        long totalStudents,
        long activeToday
) {
}

