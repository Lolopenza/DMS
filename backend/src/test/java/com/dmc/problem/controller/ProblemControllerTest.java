package com.dmc.problem.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Tests for /api/problem endpoints (problems, attempts, templates, topics).
 * 
 * Tests public list endpoints which require no authentication.
 * Submission endpoints (attempts) require authentication but not special roles.
 * Admin endpoints (POST templates/topics) require ADMIN role.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@TestPropertySource(properties = {
    "spring.test.database.replace=any",
    "spring.datasource.url=jdbc:postgresql://localhost:5432/dmc_db",
    "spring.datasource.username=dmc_user",
    "spring.datasource.password=1234"
})
public class ProblemControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test that GET /api/problem/problems is publicly accessible
     */
    @Test
    void testListProblemsPublicly() throws Exception {
        mockMvc.perform(get("/api/problem/problems")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.ArrayList.class)));
    }

    /**
     * Test listing problems with topic filter
     */
    @Test
    void testListProblemsWithTopicFilter() throws Exception {
        mockMvc.perform(get("/api/problem/problems?topicSlug=graph_theory")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Test listing problems with difficulty filter
     */
    @Test
    void testListProblemsWithDifficultyFilter() throws Exception {
        mockMvc.perform(get("/api/problem/problems?difficulty=EASY")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Test that GET /api/problem/topics is publicly accessible
     */
    @Test
    void testListTopicsPublicly() throws Exception {
        mockMvc.perform(get("/api/problem/topics")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.ArrayList.class)));
    }

    /**
     * Test that POST /api/problem/problems/{id}/attempt requires authentication
     */
    @Test
    void testSubmitAttemptRequiresAuth() throws Exception {
        ObjectNode attemptPayload = JsonNodeFactory.instance.objectNode();
        attemptPayload.put("answer", "A");

        mockMvc.perform(post("/api/problem/problems/1/attempt")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(attemptPayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that POST /api/problem/templates requires ADMIN role
     */
    @Test
    void testCreateTemplateRequiresAuth() throws Exception {
        ObjectNode templatePayload = JsonNodeFactory.instance.objectNode();
        templatePayload.put("title", "New Template");
        templatePayload.put("topicSlug", "graph_theory");
        templatePayload.put("difficulty", "MEDIUM");
        templatePayload.put("operation", "connectivity");

        mockMvc.perform(post("/api/problem/templates")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(templatePayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that POST /api/problem/templates/{id}/generate requires authentication
     */
    @Test
    void testGenerateFromTemplateRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/problem/templates/1/generate")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that POST /api/problem/templates/validate requires authentication
     */
    @Test
    void testValidateAnswerRequiresAuth() throws Exception {
        ObjectNode validatePayload = JsonNodeFactory.instance.objectNode();
        validatePayload.put("operation", "connectivity");
        validatePayload.put("answerExpression", "true");
        validatePayload.putObject("params").put("vertices", "[1,2,3]");
        validatePayload.put("candidateAnswer", "true");

        mockMvc.perform(post("/api/problem/templates/validate")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(validatePayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that POST /api/problem/topics requires ADMIN role
     */
    @Test
    void testCreateTopicRequiresAuth() throws Exception {
        ObjectNode topicPayload = JsonNodeFactory.instance.objectNode();
        topicPayload.put("name", "New Topic");
        topicPayload.put("slug", "new_topic");

        mockMvc.perform(post("/api/problem/topics")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(topicPayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that invalid problem ID returns appropriate error
     */
    @Test
    void testGetNonExistentProblem() throws Exception {
        mockMvc.perform(get("/api/problem/problems/99999")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    /**
     * Test that invalid attempt payload is rejected
     */
    @Test
    void testInvalidAttemptPayload() throws Exception {
        mockMvc.perform(post("/api/problem/problems/1/attempt")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test that invalid topic payload is rejected
     */
    @Test
    void testInvalidTopicPayload() throws Exception {
        mockMvc.perform(post("/api/problem/topics")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test empty problem list returns valid response structure
     */
    @Test
    void testEmptyProblemList() throws Exception {
        mockMvc.perform(get("/api/problem/problems?topicSlug=nonexistent_topic")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.ArrayList.class)));
    }
}
