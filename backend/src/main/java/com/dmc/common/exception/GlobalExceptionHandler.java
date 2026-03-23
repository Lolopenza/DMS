package com.dmc.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<Map<String, Object>> handleApiException(ApiException ex, HttpServletRequest request) {
        log.warn("API error code={} status={} path={} message={}", ex.getCode(), ex.getStatus().value(), request.getRequestURI(), ex.getMessage());
        return ResponseEntity.status(ex.getStatus()).body(envelope(ex.getCode(), ex.getMessage(), ex.getDetails()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> handleValidation(MethodArgumentNotValidException ex, HttpServletRequest request) {
        Map<String, Object> details = new LinkedHashMap<>();
        for (FieldError error : ex.getBindingResult().getFieldErrors()) {
            details.put(error.getField(), error.getDefaultMessage());
        }
        log.warn("Validation error path={} fields={}", request.getRequestURI(), details.keySet());
        return ResponseEntity.badRequest().body(envelope("VALIDATION_ERROR", "Validation failed", details));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneric(Exception ex, HttpServletRequest request) {
        Map<String, Object> details = Map.of("path", request.getRequestURI());
        log.error("Unhandled error path={}", request.getRequestURI(), ex);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(envelope("INTERNAL_ERROR", "Unexpected server error", details));
    }

    private Map<String, Object> envelope(String code, String message, Map<String, Object> details) {
        ApiError error = new ApiError(code, message, details, OffsetDateTime.now());
        return Map.of("error", error);
    }
}
