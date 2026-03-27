package com.dmc.analytics.controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
class AnalyticsExportSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void studentExportRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/raw.csv").param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void studentRawJsonRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/raw").param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void adminGroupExportRequiresAuthentication() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/group-anonymized.csv").param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }
}
