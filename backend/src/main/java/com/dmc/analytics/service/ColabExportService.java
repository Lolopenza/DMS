package com.dmc.analytics.service;

import com.dmc.infrastructure.mathengine.MathEngineClient;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ColabExportService {

    private final MathEngineClient mathEngineClient;
    private final ObjectMapper objectMapper;

    public JsonNode buildStarterNotebook(Long userId, int windowDays, boolean lessonMode) {
        ObjectNode payload = objectMapper.createObjectNode();
        payload.put("userId", userId);
        payload.put("windowDays", windowDays);
        payload.put("lessonMode", lessonMode);
        return mathEngineClient.post("/api/v1/colab/starter", payload);
    }
}
