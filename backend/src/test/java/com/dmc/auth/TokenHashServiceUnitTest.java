package com.dmc.auth;

import com.dmc.auth.service.TokenHashService;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class TokenHashServiceUnitTest {

    @Test
    void hashIsDeterministicAndHex() {
        TokenHashService service = new TokenHashService();

        String hash1 = service.sha256("token-value");
        String hash2 = service.sha256("token-value");

        assertThat(hash1).isEqualTo(hash2);
        assertThat(hash1).hasSize(64);
        assertThat(hash1).matches("^[a-f0-9]{64}$");
    }

    @Test
    void differentInputsProduceDifferentHashes() {
        TokenHashService service = new TokenHashService();

        String hash1 = service.sha256("token-a");
        String hash2 = service.sha256("token-b");

        assertThat(hash1).isNotEqualTo(hash2);
    }
}
