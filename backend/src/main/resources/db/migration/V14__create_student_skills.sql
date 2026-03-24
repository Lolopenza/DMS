CREATE TABLE student_skills (
    id          BIGSERIAL PRIMARY KEY,
    user_id     BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    topic_slug  VARCHAR(120) NOT NULL,
    p_know      DOUBLE PRECISION NOT NULL DEFAULT 0.25,
    p_guess     DOUBLE PRECISION NOT NULL DEFAULT 0.20,
    p_slip      DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    p_transit   DOUBLE PRECISION NOT NULL DEFAULT 0.10,
    total_attempts   INTEGER NOT NULL DEFAULT 0,
    correct_attempts INTEGER NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    deleted_at  TIMESTAMPTZ
);

CREATE TRIGGER set_student_skills_updated_at
    BEFORE UPDATE ON student_skills
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE UNIQUE INDEX idx_student_skills_user_topic
    ON student_skills(user_id, topic_slug)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_student_skills_user
    ON student_skills(user_id)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_student_skills_topic
    ON student_skills(topic_slug)
    WHERE deleted_at IS NULL;
