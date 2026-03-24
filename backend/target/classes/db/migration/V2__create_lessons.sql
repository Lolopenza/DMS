-- Курсы
CREATE TABLE courses (
    id           BIGSERIAL       PRIMARY KEY,
    title        VARCHAR(255)    NOT NULL,
    slug         VARCHAR(255)    NOT NULL,
    description  TEXT,
    order_index  INTEGER         NOT NULL DEFAULT 0,
    is_published BOOLEAN         NOT NULL DEFAULT FALSE,
    deleted_at   TIMESTAMPTZ,
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE UNIQUE INDEX idx_courses_slug_active ON courses(slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_courses_deleted ON courses(deleted_at) WHERE deleted_at IS NULL;

-- Модули курса
CREATE TABLE course_modules (
    id          BIGSERIAL       PRIMARY KEY,
    course_id   BIGINT          NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL,
    order_index INTEGER         NOT NULL DEFAULT 0,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_course_modules_course ON course_modules(course_id);
CREATE INDEX idx_course_modules_deleted ON course_modules(deleted_at) WHERE deleted_at IS NULL;

-- Уроки
CREATE TABLE lessons (
    id                BIGSERIAL       PRIMARY KEY,
    module_id         BIGINT          NOT NULL REFERENCES course_modules(id) ON DELETE CASCADE,
    title             VARCHAR(255)    NOT NULL,
    slug              VARCHAR(255)    NOT NULL,
    content_text      TEXT,
    content_video_url VARCHAR(512),
    free_only         BOOLEAN         NOT NULL DEFAULT TRUE,
    order_index       INTEGER         NOT NULL DEFAULT 0,
    deleted_at        TIMESTAMPTZ,
    created_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at        TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_lessons_updated_at
    BEFORE UPDATE ON lessons
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE UNIQUE INDEX idx_lessons_module_slug_active ON lessons(module_id, slug) WHERE deleted_at IS NULL;
CREATE INDEX idx_lessons_module ON lessons(module_id);
CREATE INDEX idx_lessons_deleted ON lessons(deleted_at) WHERE deleted_at IS NULL;

-- Прогресс пользователя по урокам
CREATE TABLE lesson_progress (
    id           BIGSERIAL       PRIMARY KEY,
    user_id      BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    lesson_id    BIGINT          NOT NULL REFERENCES lessons(id) ON DELETE CASCADE,
    completed_at TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    created_at   TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    CONSTRAINT uc_lesson_progress UNIQUE (user_id, lesson_id)
);

CREATE INDEX idx_lesson_progress_user ON lesson_progress(user_id);
CREATE INDEX idx_lesson_progress_lesson ON lesson_progress(lesson_id);
