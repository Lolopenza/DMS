package com.dmc.analytics.controller;

import com.dmc.analytics.dto.BktAnalyticsSummaryResponse;
import com.dmc.analytics.dto.RawLearningAnalyticsDatasetResponse;
import com.dmc.analytics.service.BktAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/analytics")
@RequiredArgsConstructor
public class AnalyticsController {

    private final BktAnalyticsService bktAnalyticsService;

    @GetMapping("/bkt/summary")
    public ResponseEntity<BktAnalyticsSummaryResponse> bktSummary(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String internalKey,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        bktAnalyticsService.assertInternalKey(internalKey);
        return ResponseEntity.ok(bktAnalyticsService.summaryForUser(userId, windowDays));
    }

    @GetMapping("/bkt/raw-dataset")
    public ResponseEntity<RawLearningAnalyticsDatasetResponse> rawDataset(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String internalKey,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        bktAnalyticsService.assertInternalKey(internalKey);
        return ResponseEntity.ok(bktAnalyticsService.rawDatasetForUser(userId, windowDays));
    }

    @GetMapping(value = "/bkt/raw-dataset.csv", produces = "text/csv")
    public ResponseEntity<String> rawDatasetCsv(
            @RequestHeader(value = "X-Internal-Api-Key", required = false) String internalKey,
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        bktAnalyticsService.assertInternalKey(internalKey);
        String csv = bktAnalyticsService.rawDatasetCsvForUser(userId, windowDays);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=learning-analytics-" + userId + ".csv")
                .body(csv);
    }
}

