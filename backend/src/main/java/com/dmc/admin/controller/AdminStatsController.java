package com.dmc.admin.controller;

import com.dmc.admin.dto.AdminStatsResponse;
import com.dmc.user.entity.UserRole;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/v1/admin")
@RequiredArgsConstructor
public class AdminStatsController {

    private final UserRepository userRepository;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/stats")
    public ResponseEntity<AdminStatsResponse> stats() {
        long totalStudents = userRepository.countByRole(UserRole.STUDENT);
        long activeToday = userRepository.countByRoleAndLastActive(UserRole.STUDENT, LocalDate.now());
        return ResponseEntity.ok(new AdminStatsResponse(totalStudents, activeToday));
    }
}

