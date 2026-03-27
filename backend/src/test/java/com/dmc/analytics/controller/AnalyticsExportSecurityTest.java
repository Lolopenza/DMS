package com.dmc.analytics.controller;

import com.dmc.support.AbstractPostgresIntegrationTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@AutoConfigureMockMvc
class AnalyticsExportSecurityTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void should_require_authentication_for_student_csv_export() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/raw.csv").param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_require_authentication_for_student_raw_json_export() throws Exception {
        mockMvc.perform(get("/api/v1/analytics/me/raw").param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void should_require_authentication_for_admin_group_export() throws Exception {
        mockMvc.perform(get("/api/v1/admin/analytics/group-anonymized.csv").param("windowDays", "30"))
                .andExpect(status().isUnauthorized());
    }
}
