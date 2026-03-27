package com.dmc.feedback.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.feedback")
public record FeedbackProperties(
        int promptDelaySeconds
) {
    public FeedbackProperties {
        if (promptDelaySeconds <= 0) {
            promptDelaySeconds = 300;
        }
    }
}
