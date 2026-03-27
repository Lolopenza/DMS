package com.dmc.settings.service;

import com.dmc.common.exception.ApiException;
import com.dmc.settings.entity.SiteSetting;
import com.dmc.settings.repository.SiteSettingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class SiteSettingService {

    private final SiteSettingRepository repository;

    public SiteSetting upsert(String key, String value) {
        if (key == null || key.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_KEY", "Key is required");
        }
        if (value == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_VALUE", "Value is required");
        }
        SiteSetting setting = repository.findById(key).orElse(SiteSetting.builder().key(key).build());
        setting.setValue(value);
        setting.setUpdatedAt(OffsetDateTime.now());
        return repository.save(setting);
    }

    public String getValueOrNull(String key) {
        return repository.findById(key).map(SiteSetting::getValue).orElse(null);
    }
}

