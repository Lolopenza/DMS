package com.dmc.admin.controller;

import com.dmc.settings.service.SiteSettingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/settings")
@RequiredArgsConstructor
public class AdminSettingsController {

    private final SiteSettingService siteSettingService;

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{key}")
    public ResponseEntity<Map<String, Object>> putSetting(@PathVariable String key, @RequestBody Map<String, Object> payload) {
        String value = payload == null ? null : (payload.get("value") == null ? null : String.valueOf(payload.get("value")));
        var saved = siteSettingService.upsert(key, value);
        return ResponseEntity.ok(Map.of(
                "key", saved.getKey(),
                "value", saved.getValue(),
                "updatedAt", saved.getUpdatedAt()
        ));
    }
}

