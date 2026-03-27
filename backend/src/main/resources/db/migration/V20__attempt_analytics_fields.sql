ALTER TABLE problem_attempts
    ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER,
    ADD COLUMN IF NOT EXISTS time_to_first_action_seconds INTEGER,
    ADD COLUMN IF NOT EXISTS hint_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS error_type VARCHAR(32),
    ADD COLUMN IF NOT EXISTS difficulty_at_attempt VARCHAR(16),
    ADD COLUMN IF NOT EXISTS topic_slug VARCHAR(120),
    ADD COLUMN IF NOT EXISTS topic_path VARCHAR(255);

ALTER TABLE generated_problem_attempts
    ADD COLUMN IF NOT EXISTS time_spent_seconds INTEGER,
    ADD COLUMN IF NOT EXISTS time_to_first_action_seconds INTEGER,
    ADD COLUMN IF NOT EXISTS hint_used BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS error_type VARCHAR(32),
    ADD COLUMN IF NOT EXISTS difficulty_at_attempt VARCHAR(16),
    ADD COLUMN IF NOT EXISTS topic_slug VARCHAR(120),
    ADD COLUMN IF NOT EXISTS topic_path VARCHAR(255);

CREATE INDEX IF NOT EXISTS idx_problem_attempts_user_created_topic
    ON problem_attempts(user_id, created_at DESC, topic_slug);

CREATE INDEX IF NOT EXISTS idx_generated_attempts_user_created_topic
    ON generated_problem_attempts(user_id, created_at DESC, topic_slug);
