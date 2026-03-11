CREATE TYPE problem_type AS ENUM ('NUMERIC', 'MULTIPLE_CHOICE', 'TRUTH_TABLE', 'EXPRESSION');
CREATE TYPE difficulty AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- Задачи
CREATE TABLE problems (
    id                 BIGSERIAL       PRIMARY KEY,
    title              VARCHAR(255)    NOT NULL,
    type               problem_type    NOT NULL,
    difficulty         difficulty      NOT NULL DEFAULT 'MEDIUM',
    topic              VARCHAR(100),                -- combinatorics, logic, graph_theory, ...
    question_text      TEXT            NOT NULL,
    correct_answer     JSONB           NOT NULL,    -- зависит от type: число, массив вариантов, ...
    hint_text          TEXT,
    explanation_text   TEXT,
    xp_reward          INTEGER         NOT NULL DEFAULT 10,
    free_only          BOOLEAN         NOT NULL DEFAULT TRUE,
    deleted_at         TIMESTAMPTZ,
    created_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at         TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_problems_updated_at
    BEFORE UPDATE ON problems
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_problems_topic ON problems(topic);
CREATE INDEX idx_problems_type ON problems(type);
CREATE INDEX idx_problems_deleted ON problems(deleted_at) WHERE deleted_at IS NULL;

-- Попытки решения
CREATE TABLE problem_attempts (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    problem_id  BIGINT          NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    answer      JSONB           NOT NULL,
    correct     BOOLEAN         NOT NULL,
    xp_earned   INTEGER         NOT NULL DEFAULT 0,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_problem_attempts_user ON problem_attempts(user_id);
CREATE INDEX idx_problem_attempts_problem ON problem_attempts(problem_id);
