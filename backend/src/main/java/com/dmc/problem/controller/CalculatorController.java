package com.dmc.problem.controller;

import com.dmc.common.exception.ApiException;
import com.dmc.common.security.UserPrincipal;
import com.dmc.problem.service.CalculatorProxyService;
import com.fasterxml.jackson.databind.JsonNode;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/calculator")
@RequiredArgsConstructor
public class CalculatorController {

    private final CalculatorProxyService calculatorProxyService;

    @PostMapping("/chat")
    public ResponseEntity<JsonNode> chat(
            @RequestBody JsonNode payload
    ) {
        Long userId = currentUserIdOrNull();
        if (userId == null) {
            return ResponseEntity.ok(calculatorProxyService.proxyAnonymous("chat", null, payload));
        }
        return ResponseEntity.ok(calculatorProxyService.proxy(userId, "chat", null, payload));
    }

    @PostMapping("/{section}")
    public ResponseEntity<JsonNode> proxySection(
            @PathVariable String section,
            @RequestBody JsonNode payload
    ) {
        return ResponseEntity.ok(calculatorProxyService.proxy(currentUserId(), section, null, payload));
    }

    @PostMapping("/{section}/{operation}")
    public ResponseEntity<JsonNode> proxySectionOperation(
            @PathVariable String section,
            @PathVariable String operation,
            @RequestBody JsonNode payload
    ) {
        return ResponseEntity.ok(calculatorProxyService.proxy(currentUserId(), section, operation, payload));
    }


    private Long currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal principal)) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "Authentication is required");
        }
        return principal.getId();
    }

    private Long currentUserIdOrNull() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || authentication instanceof AnonymousAuthenticationToken) {
            return null;
        }
        if (authentication.getPrincipal() instanceof UserPrincipal principal) {
            return principal.getId();
        }
        return null;
    }
}
