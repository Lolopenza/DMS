package com.dmc.problem.controller;

import com.dmc.support.AbstractPostgresIntegrationTest;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Tests for /api/calculator endpoints (proxy to math-engine).
 * 
 * Note: These tests require running with docker-compose services up.
 * Skipped if auth services are unavailable.
 */
@AutoConfigureMockMvc
public class CalculatorControllerTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @BeforeEach
    void setUp() {
        // Could set up test data or mock auth here if needed
    }

    /**
     * Test that /api/calculator/chat endpoint is accessible with auth
     * and proxies requests to math-engine.
     */
    @Test
    void testChatEndpointExists() throws Exception {
        // This test just verifies the endpoint path exists
        // Full integration testing would require valid JWT token
        
        ObjectNode payload = JsonNodeFactory.instance.objectNode();
        ObjectNode messageObj = JsonNodeFactory.instance.objectNode();
        messageObj.put("role", "user");
        messageObj.put("content", "hello");
        payload.putArray("messages").add(messageObj);
        payload.put("subject", "graph_theory");
        payload.putNull("module");

        // Without valid auth, should get 401
        mockMvc.perform(post("/api/calculator/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that /api/calculator/{section} endpoint returns 401 without auth
     */
    @Test
    void testProxySectionEndpointRequiresAuth() throws Exception {
        ObjectNode payload = JsonNodeFactory.instance.objectNode();
        payload.putArray("vertices").add(1).add(2).add(3);

        mockMvc.perform(post("/api/calculator/graph_theory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that /api/calculator/{section}/{operation} endpoint returns 401 without auth
     */
    @Test
    void testProxySectionOperationEndpointRequiresAuth() throws Exception {
        ObjectNode payload = JsonNodeFactory.instance.objectNode();
        payload.putArray("vertices").add(1).add(2).add(3);

        mockMvc.perform(post("/api/calculator/graph_theory/connectivity")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that invalid JSON payloads are handled gracefully
     */
    @Test
    void testInvalidJsonPayload() throws Exception {
        mockMvc.perform(post("/api/calculator/chat")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json")
                .header("Authorization", "Bearer invalid-token"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test that missing required sections/operations fail appropriately
     */
    @Test
    void testMalformedEndpointPath() throws Exception {
        ObjectNode payload = JsonNodeFactory.instance.objectNode();
        payload.put("test", "data");

        // Test endpoint with only slashes (should fail)
        mockMvc.perform(post("/api/calculator/")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(payload)))
                .andExpect(status().isNotFound());
    }
}
