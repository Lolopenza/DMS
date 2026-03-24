CREATE TABLE generated_problems (
    id                  BIGSERIAL PRIMARY KEY,
    user_id             BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    template_id         BIGINT       REFERENCES problem_templates(id) ON DELETE SET NULL,
    generation_mode     VARCHAR(20)  NOT NULL,
    source_model        VARCHAR(80),
    topic_slug          VARCHAR(120),
    difficulty          difficulty   NOT NULL DEFAULT 'MEDIUM',
    difficulty_score    NUMERIC(4,3) NOT NULL DEFAULT 0.500,
    question_text       TEXT         NOT NULL,
    params_json         JSONB        NOT NULL,
    correct_answer      JSONB,
    answer_expression   TEXT,
    operation           VARCHAR(100),
    attempt_count       INTEGER      NOT NULL DEFAULT 0,
    correct_count       INTEGER      NOT NULL DEFAULT 0,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_generated_problems_updated_at
    BEFORE UPDATE ON generated_problems
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_generated_problems_user_created
    ON generated_problems(user_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_generated_problems_template_created
    ON generated_problems(template_id, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE INDEX idx_generated_problems_topic_created
    ON generated_problems(topic_slug, created_at DESC)
    WHERE deleted_at IS NULL;

CREATE TABLE generated_problem_attempts (
    id                    BIGSERIAL PRIMARY KEY,
    user_id               BIGINT       NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    generated_problem_id  BIGINT       NOT NULL REFERENCES generated_problems(id) ON DELETE CASCADE,
    answer                JSONB        NOT NULL,
    correct               BOOLEAN      NOT NULL,
    confidence            NUMERIC(4,3),
    verification_method   VARCHAR(32)  NOT NULL,
    feedback              TEXT,
    xp_earned             INTEGER      NOT NULL DEFAULT 0,
    created_at            TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_generated_problem_attempts_user_created
    ON generated_problem_attempts(user_id, created_at DESC);

CREATE INDEX idx_generated_problem_attempts_problem_created
    ON generated_problem_attempts(generated_problem_id, created_at DESC);
