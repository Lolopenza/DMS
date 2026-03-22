package com.dmc.support;

import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
@SpringBootTest
@ActiveProfiles("test")
public abstract class AbstractPostgresIntegrationTest {

    @Container
    static final PostgreSQLContainer<?> POSTGRES = new PostgreSQLContainer<>("postgres:16-alpine")
            .withDatabaseName("dmc_test")
            .withUsername("postgres")
            .withPassword("postgres");

    @DynamicPropertySource
    static void registerProperties(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url", POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username", POSTGRES::getUsername);
        registry.add("spring.datasource.password", POSTGRES::getPassword);
        registry.add("spring.datasource.driver-class-name", () -> "org.postgresql.Driver");

        registry.add("spring.flyway.enabled", () -> "true");

        registry.add("spring.data.redis.host", () -> "localhost");
        registry.add("spring.data.redis.port", () -> "6399");

        registry.add("app.security.jwt.issuer", () -> "dmc-backend-test");
        registry.add("app.security.jwt.access-token-ttl-seconds", () -> "900");
        registry.add("app.security.jwt.refresh-token-ttl-seconds", () -> "604800");
        registry.add("app.security.jwt.key", () -> "test-jwt-secret-key-with-at-least-64-characters-for-hs384-signing!");
        registry.add("app.security.jwt.cookie-secure", () -> "false");
        registry.add("app.security.jwt.cookie-same-site", () -> "Lax");

        registry.add("spring.mail.host", () -> "localhost");
        registry.add("spring.mail.port", () -> "1025");

        registry.add("management.health.redis.enabled", () -> "false");
        registry.add("management.health.rabbit.enabled", () -> "false");
    }
}
