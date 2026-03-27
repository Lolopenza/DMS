package com.dmc.analytics.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "app.integration.math-engine.api-key=test-internal-key"
})
class AnalyticsControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void requiresInternalKeyWhenConfigured() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/summary")
                        .param("userId", "1")
                        .param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void acceptsInternalKey() throws Exception {
        // We do not assert the full payload here; user may not exist in test DB.
        mockMvc.perform(get("/api/analytics/bkt/summary")
                        .header("X-Internal-Api-Key", "test-internal-key")
                        .param("userId", "999999")
                        .param("windowDays", "30"))
                .andExpect(status().isNotFound());
    }

    @Test
    void rawDatasetRequiresInternalKeyWhenConfigured() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/raw-dataset")
                        .param("userId", "1")
                        .param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void rawDatasetCsvAcceptsInternalKey() throws Exception {
        mockMvc.perform(get("/api/analytics/bkt/raw-dataset.csv")
                        .header("X-Internal-Api-Key", "test-internal-key")
                        .param("userId", "999999")
                        .param("windowDays", "30"))
                .andExpect(status().isNotFound());
    }
}

