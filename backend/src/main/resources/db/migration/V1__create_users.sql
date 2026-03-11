CREATE TYPE user_role AS ENUM ('STUDENT', 'ADMIN');
CREATE TYPE user_plan AS ENUM ('FREE', 'PRO');

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TABLE users (
    id          BIGSERIAL       PRIMARY KEY,
    email       VARCHAR(255)    NOT NULL UNIQUE,
    username    VARCHAR(50)     NOT NULL UNIQUE,
    password    VARCHAR(255)    NOT NULL,
    role        user_role       NOT NULL DEFAULT 'STUDENT',
    plan        user_plan       NOT NULL DEFAULT 'FREE',
    xp          INTEGER         NOT NULL DEFAULT 0,
    streak      INTEGER         NOT NULL DEFAULT 0,
    last_active DATE,
    avatar_url  VARCHAR(512),
    enabled     BOOLEAN         NOT NULL DEFAULT TRUE,
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_users_email      ON users(email);
CREATE INDEX idx_users_username   ON users(username);
CREATE INDEX idx_users_role       ON users(role);
CREATE INDEX idx_users_deleted_at ON users(deleted_at) WHERE deleted_at IS NULL;
