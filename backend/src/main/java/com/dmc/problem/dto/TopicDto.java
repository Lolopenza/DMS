package com.dmc.problem.dto;

public record TopicDto(
        Long id,
        String name,
        String slug,
        Long parentId
) {
}
