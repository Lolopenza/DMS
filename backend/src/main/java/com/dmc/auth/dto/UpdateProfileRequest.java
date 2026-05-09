package com.dmc.auth.dto;

import jakarta.validation.constraints.Size;

/**
 * Partial profile update; fields omitted or blank are left unchanged.
 */
public record UpdateProfileRequest(
        @Size(max = 30) String careerTrack
) {
}
