package com.dmc.admin.service;

import com.dmc.admin.dto.AdminUserItemDto;
import com.dmc.admin.dto.AdminUserListResponse;
import com.dmc.common.exception.ApiException;
import com.dmc.user.entity.User;
import com.dmc.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserListResponse listUsers(int page, int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));

        Page<User> users = userRepository.findAll(PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "createdAt")
        ));

        return new AdminUserListResponse(
                users.getContent().stream().map(this::toDto).toList(),
                users.getNumber(),
                users.getSize(),
                users.getTotalElements(),
                users.getTotalPages()
        );
    }

    public AdminUserItemDto deactivateUser(Long adminUserId, Long targetUserId) {
        if (adminUserId != null && adminUserId.equals(targetUserId)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "SELF_DEACTIVATE_FORBIDDEN", "Admin cannot deactivate their own account");
        }
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setEnabled(false);
        return toDto(userRepository.save(user));
    }

    public AdminUserItemDto activateUser(Long targetUserId) {
        User user = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "USER_NOT_FOUND", "User not found"));
        user.setEnabled(true);
        return toDto(userRepository.save(user));
    }

    private AdminUserItemDto toDto(User user) {
        return new AdminUserItemDto(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getRole() == null ? null : user.getRole().name(),
                Boolean.TRUE.equals(user.getEnabled()),
                user.getCreatedAt()
        );
    }
}

