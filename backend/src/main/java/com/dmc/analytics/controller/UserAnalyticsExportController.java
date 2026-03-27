package com.dmc.analytics.controller;

import com.dmc.analytics.dto.RawLearningAnalyticsDatasetResponse;
import com.dmc.analytics.service.BktAnalyticsService;
import com.dmc.analytics.service.ColabExportService;
import com.dmc.common.exception.ApiException;
import com.dmc.common.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/analytics")
@RequiredArgsConstructor
public class UserAnalyticsExportController {

    private final BktAnalyticsService bktAnalyticsService;
    private final ColabExportService colabExportService;

    @GetMapping(value = "/me/raw.csv", produces = "text/csv")
    public ResponseEntity<String> myRawCsv(
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        Long userId = currentUserId();
        String csv = bktAnalyticsService.rawDatasetCsvForUser(userId, windowDays);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=my-learning-analytics-" + userId + ".csv")
                .body(csv);
    }

    @GetMapping("/me/raw")
    public ResponseEntity<RawLearningAnalyticsDatasetResponse> myRawDataset(
            @RequestParam(required = false, defaultValue = "30") int windowDays
    ) {
        return ResponseEntity.ok(bktAnalyticsService.rawDatasetForUser(currentUserId(), windowDays));
    }

    @GetMapping("/me/colab-starter")
    public ResponseEntity<JsonNode> myColabStarter(
            @RequestParam(required = false, defaultValue = "30") int windowDays,
            @RequestParam(required = false, defaultValue = "true") boolean lessonMode
    ) {
        return ResponseEntity.ok(colabExportService.buildStarterNotebook(currentUserId(), windowDays, lessonMode));
    }

    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
        }
        return principal.getId();
    }
}
