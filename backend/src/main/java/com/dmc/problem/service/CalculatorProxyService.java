package com.dmc.problem.service;

import com.dmc.common.exception.ApiException;
import com.dmc.infrastructure.mathengine.MathEngineClient;
import com.dmc.problem.entity.CalcHistory;
import com.dmc.problem.repository.CalcHistoryRepository;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class CalculatorProxyService {

    private final MathEngineClient mathEngineClient;
    private final CalcHistoryRepository calcHistoryRepository;
    private final UserRepository userRepository;

        public JsonNode proxyAnonymous(String section, String operation, JsonNode payload) {
                String endpoint = endpoint(section, operation);
                return mathEngineClient.post(endpoint, payload);
        }

    @Transactional
    public JsonNode proxy(Long userId, String section, String operation, JsonNode payload) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));

                String endpoint = endpoint(section, operation);

        JsonNode response = mathEngineClient.post(endpoint, payload);

        CalcHistory history = CalcHistory.builder()
                .user(user)
                .section(section)
                .operation(operation == null || operation.isBlank() ? "default" : operation)
                .inputData(payload)
                .outputData(response)
                .createdAt(OffsetDateTime.now())
                .build();
        calcHistoryRepository.save(history);

        return response;
    }

        private String endpoint(String section, String operation) {
                return operation == null || operation.isBlank()
                                ? "/api/v1/" + section + "/"
                                : "/api/v1/" + section + "/" + operation;
        }
}
