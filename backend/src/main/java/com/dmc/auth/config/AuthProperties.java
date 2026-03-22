package com.dmc.auth.config;

import jakarta.validation.constraints.Min;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Validated
@ConfigurationProperties(prefix = "app.auth")
public class AuthProperties {

    @Min(1)
    private int lockoutThreshold = 5;

    @Min(1)
    private int lockoutMinutes = 15;

    @Min(1)
    private int passwordResetTtlMinutes = 30;

    public int getLockoutThreshold() {
        return lockoutThreshold;
    }

    public void setLockoutThreshold(int lockoutThreshold) {
        this.lockoutThreshold = lockoutThreshold;
    }

    public int getLockoutMinutes() {
        return lockoutMinutes;
    }

    public void setLockoutMinutes(int lockoutMinutes) {
        this.lockoutMinutes = lockoutMinutes;
    }

    public int getPasswordResetTtlMinutes() {
        return passwordResetTtlMinutes;
    }

    public void setPasswordResetTtlMinutes(int passwordResetTtlMinutes) {
        this.passwordResetTtlMinutes = passwordResetTtlMinutes;
    }
}