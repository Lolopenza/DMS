ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'TEACHER';

CREATE TABLE topics (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(120) NOT NULL,
    slug        VARCHAR(120) NOT NULL,
    parent_id   BIGINT REFERENCES topics(id) ON DELETE SET NULL,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_topics_updated_at
    BEFORE UPDATE ON topics
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE UNIQUE INDEX idx_topics_slug_active ON topics(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_topics_parent ON topics(parent_id);
CREATE INDEX idx_topics_deleted ON topics(deleted_at) WHERE deleted_at IS NULL;

CREATE TABLE problem_topics (
    problem_id   BIGINT NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    topic_id     BIGINT NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (problem_id, topic_id)
);

CREATE INDEX idx_problem_topics_topic ON problem_topics(topic_id);

CREATE TABLE problem_templates (
    id                  BIGSERIAL PRIMARY KEY,
    title               VARCHAR(255) NOT NULL,
    topic_slug          VARCHAR(120),
    difficulty          difficulty NOT NULL DEFAULT 'MEDIUM',
    operation           VARCHAR(100) NOT NULL,
    question_template   TEXT NOT NULL,
    parameters_schema   JSONB NOT NULL,
    answer_expression   TEXT NOT NULL,
    active              BOOLEAN NOT NULL DEFAULT TRUE,
    deleted_at          TIMESTAMPTZ,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_problem_templates_updated_at
    BEFORE UPDATE ON problem_templates
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_problem_templates_topic ON problem_templates(topic_slug);
CREATE INDEX idx_problem_templates_deleted ON problem_templates(deleted_at) WHERE deleted_at IS NULL;
