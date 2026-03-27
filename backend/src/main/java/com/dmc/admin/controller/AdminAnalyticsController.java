package com.dmc.admin.controller;

import com.dmc.analytics.dto.RawLearningAnalyticsDatasetResponse;
import com.dmc.analytics.service.BktAnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/admin/analytics")
@RequiredArgsConstructor
public class AdminAnalyticsController {

    private final BktAnalyticsService bktAnalyticsService;

    @GetMapping("/raw-preview")
    public ResponseEntity<RawLearningAnalyticsDatasetResponse> rawPreview(
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        return ResponseEntity.ok(bktAnalyticsService.rawDatasetForUser(userId, windowDays));
    }

    @GetMapping(value = "/raw-preview.csv", produces = "text/csv")
    public ResponseEntity<String> rawPreviewCsv(
            @RequestParam Long userId,
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        String csv = bktAnalyticsService.rawDatasetCsvForUser(userId, windowDays);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-raw-analytics-" + userId + ".csv")
                .body(csv);
    }

    @GetMapping(value = "/group-anonymized.csv", produces = "text/csv")
    public ResponseEntity<String> groupAnonymizedCsv(
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        String csv = bktAnalyticsService.rawDatasetCsvForStudentsAnonymized(windowDays);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=admin-group-anonymized-" + windowDays + "d.csv")
                .body(csv);
    }
}
