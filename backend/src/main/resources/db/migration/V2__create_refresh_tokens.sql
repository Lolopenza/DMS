CREATE TABLE refresh_tokens (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token       VARCHAR(512)    NOT NULL UNIQUE,
    ip_address  VARCHAR(45),                         -- IPv4 / IPv6
    user_agent  VARCHAR(512),                        -- браузер / устройство
    expires_at  TIMESTAMPTZ     NOT NULL,
    revoked     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_rt_token   ON refresh_tokens(token);
CREATE INDEX idx_rt_user_id ON refresh_tokens(user_id);
