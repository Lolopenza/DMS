ALTER TABLE refresh_tokens
    ADD COLUMN IF NOT EXISTS session_id VARCHAR(64),
    ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_rt_session_id ON refresh_tokens(session_id);
CREATE INDEX IF NOT EXISTS idx_rt_active_user ON refresh_tokens(user_id, revoked) WHERE revoked = FALSE;
