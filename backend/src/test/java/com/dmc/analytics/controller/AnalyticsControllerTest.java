package com.dmc.analytics.controller;

import com.dmc.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "app.integration.math-engine.api-key=test-internal-key"
})
class AnalyticsControllerTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void should_require_internal_key_for_summary_when_key_is_configured() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/summary")
                        .param("userId", "1")
                        .param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_accept_internal_key_for_summary_endpoint() throws Exception {
        // We do not assert the full payload here; user may not exist in test DB.
        mockMvc.perform(get("/api/analytics/bkt/summary")
                        .header("X-Internal-Api-Key", "test-internal-key")
                        .param("userId", "999999")
                        .param("windowDays", "30"))
                .andExpect(status().isNotFound());
    }

    @Test
    void should_require_internal_key_for_raw_dataset_when_key_is_configured() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/raw-dataset")
                        .param("userId", "1")
                        .param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_accept_internal_key_for_raw_dataset_csv_endpoint() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/raw-dataset.csv")
                        .header("X-Internal-Api-Key", "test-internal-key")
                        .param("userId", "999999")
                        .param("windowDays", "30"))
                .andExpect(status().isNotFound());
    }

    @Test
    void should_return_bad_request_for_invalid_window_days_even_with_valid_internal_key() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/summary")
                        .header("X-Internal-Api-Key", "test-internal-key")
                        .param("userId", "999999")
                        .param("windowDays", "0"))
                .andExpect(status().isBadRequest());
    }
}

