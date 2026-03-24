package com.dmc.problem.dto;

public record NextProblemResponse(
        GeneratedProblemItemDto problem,
        StudentSkillDto skill,
        String recommendedDifficulty
) {
}
