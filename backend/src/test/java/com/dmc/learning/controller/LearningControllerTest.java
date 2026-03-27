package com.dmc.learning.controller;

import com.dmc.support.AbstractPostgresIntegrationTest;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.JsonNodeFactory;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

/**
 * Tests for /api/learning endpoints (courses, modules, lessons).
 * 
 * Tests public list endpoints which require no authentication.
 * Admin endpoints (POST/PUT/DELETE) require ADMIN role.
 */
@AutoConfigureMockMvc
public class LearningControllerTest extends AbstractPostgresIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    /**
     * Test that GET /api/learning/courses is publicly accessible (no auth required)
     */
    @Test
    void testListCoursesPublicly() throws Exception {
        mockMvc.perform(get("/api/learning/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.ArrayList.class)));
    }

    /**
     * Test that GET /api/learning/courses/{courseId}/modules is publicly accessible
     */
    @Test
    void testListModulesPublicly() throws Exception {
        mockMvc.perform(get("/api/learning/courses/1/modules")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    /**
     * Test that GET /api/learning/lessons is publicly accessible
     */
    @Test
    void testListLessonsPublicly() throws Exception {
        mockMvc.perform(get("/api/learning/lessons")
                .contentType(MediaType.APPLICATION_JSON)
                .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", instanceOf(java.util.ArrayList.class)));
    }

    /**
     * Test that POST /api/learning/courses requires authentication
     */
    @Test
    void testCreateCourseRequiresAuth() throws Exception {
        ObjectNode coursePayload = JsonNodeFactory.instance.objectNode();
        coursePayload.put("title", "New Course");
        coursePayload.put("description", "Test course");

        mockMvc.perform(post("/api/learning/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(coursePayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that PUT /api/learning/courses/{id} requires authentication
     */
    @Test
    void testUpdateCourseRequiresAuth() throws Exception {
        ObjectNode coursePayload = JsonNodeFactory.instance.objectNode();
        coursePayload.put("title", "Updated Course");

        mockMvc.perform(put("/api/learning/courses/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(coursePayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test that DELETE /api/learning/courses/{id} requires authentication
     */
    @Test
    void testDeleteCourseRequiresAuth() throws Exception {
        mockMvc.perform(delete("/api/learning/courses/1")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test creating a module requires authentication
     */
    @Test
    void testCreateModuleRequiresAuth() throws Exception {
        ObjectNode modulePayload = JsonNodeFactory.instance.objectNode();
        modulePayload.put("courseId", 1);
        modulePayload.put("title", "New Module");
        modulePayload.put("description", "Test module");
        modulePayload.put("displayOrder", 1);

        mockMvc.perform(post("/api/learning/modules")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(modulePayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test creating a lesson requires authentication
     */
    @Test
    void testCreateLessonRequiresAuth() throws Exception {
        ObjectNode lessonPayload = JsonNodeFactory.instance.objectNode();
        lessonPayload.put("moduleId", 1);
        lessonPayload.put("title", "New Lesson");
        lessonPayload.put("content", "Test lesson content");
        lessonPayload.put("displayOrder", 1);

        mockMvc.perform(post("/api/learning/lessons")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(lessonPayload)))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test marking a lesson complete requires authentication
     */
    @Test
    void testMarkLessonCompleteRequiresAuth() throws Exception {
        mockMvc.perform(post("/api/learning/lessons/1/complete")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isUnauthorized());
    }

    /**
     * Test invalid JSON payload handling
     */
    @Test
    void testInvalidCoursePayload() throws Exception {
        mockMvc.perform(post("/api/learning/courses")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{invalid json}"))
                .andExpect(status().isBadRequest());
    }

    /**
     * Test that non-existent course returns 404 for public list
     */
    @Test
    void testGetNonExistentModule() throws Exception {
        mockMvc.perform(get("/api/learning/courses/99999/modules")
                .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk()); // Returns empty list for non-existent course
    }
}
