package com.dmc.infrastructure.mathengine;

import com.dmc.common.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class MathEngineClient {

    private final MathEngineProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .version(HttpClient.Version.HTTP_1_1)
            .build();

    public JsonNode post(String endpointPath, JsonNode payload) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(properties.getBaseUrl() + endpointPath))
                    .timeout(Duration.ofSeconds(30))
                    .version(HttpClient.Version.HTTP_1_1)
                    .header("Content-Type", "application/json")
                    .header("X-Internal-Api-Key", properties.getApiKey())
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                throw new ApiException(
                        HttpStatus.BAD_GATEWAY,
                        "MATH_ENGINE_ERROR",
                        "Math engine returned " + response.statusCode(),
                        Map.of("body", response.body())
                );
            }
            return objectMapper.readTree(response.body());
        } catch (IOException | InterruptedException ex) {
            if (ex instanceof InterruptedException) {
                Thread.currentThread().interrupt();
            }
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "MATH_ENGINE_UNAVAILABLE",
                    "Failed to call math engine",
                    Map.of("reason", ex.getMessage())
            );
        }
    }

    public boolean validateTemplateAnswer(String operation, String answerExpression, JsonNode params, JsonNode candidateAnswer) {
        ObjectNode request = objectMapper.createObjectNode();
        request.put("operation", operation);
        request.put("answerExpression", answerExpression);
        request.set("params", params);
        request.set("candidateAnswer", candidateAnswer);
        JsonNode response = post("/api/v1/problem_templates/validate", request);
        return response.path("correct").asBoolean(false);
    }
}
