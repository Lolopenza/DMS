CREATE TABLE IF NOT EXISTS user_feature_milestone (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    feature_key VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ,
    deleted_at TIMESTAMPTZ,
    UNIQUE (user_id, feature_key)
);

CREATE INDEX IF NOT EXISTS idx_user_feature_milestone_user ON user_feature_milestone(user_id);
