package com.dmc.analytics;

import com.dmc.analytics.dto.RawLearningAnalyticsDatasetResponse;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;

class RawLearningAnalyticsDatasetResponseTest {

    @Test
    void attemptRow_supportsExpandedMlFeatures() {
        RawLearningAnalyticsDatasetResponse.AttemptRow row = new RawLearningAnalyticsDatasetResponse.AttemptRow(
                "generated",
                "algebra",
                "math.algebra",
                "MEDIUM",
                0.60,
                false,
                120,
                20,
                true,
                "ARITHMETIC_ERROR",
                3,
                1,
                23,
                6,
                true,
                OffsetDateTime.parse("2026-03-26T18:00:00Z")
        );
        RawLearningAnalyticsDatasetResponse response = new RawLearningAnalyticsDatasetResponse(
                1L,
                30,
                OffsetDateTime.parse("2026-02-26T00:00:00Z"),
                OffsetDateTime.parse("2026-03-26T00:00:00Z"),
                List.of(row),
                Map.of("schemaVersion", 2)
        );
        assertEquals(1, response.attempts().size());
        assertEquals("ARITHMETIC_ERROR", response.attempts().getFirst().errorType());
        assertEquals(2, response.metadata().get("schemaVersion"));
    }
}
