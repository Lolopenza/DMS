-- Сессии чата с AI
CREATE TABLE chat_sessions (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title       VARCHAR(255)    NOT NULL DEFAULT 'New chat',
    deleted_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_chat_sessions_updated_at
    BEFORE UPDATE ON chat_sessions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE INDEX idx_chat_sessions_user ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_deleted ON chat_sessions(deleted_at) WHERE deleted_at IS NULL;

-- Сообщения в сессии
CREATE TYPE chat_message_role AS ENUM ('user', 'assistant');

CREATE TABLE chat_messages (
    id          BIGSERIAL           PRIMARY KEY,
    session_id  BIGINT              NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
    role        chat_message_role   NOT NULL,
    content     TEXT                NOT NULL,
    created_at  TIMESTAMPTZ         NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_chat_messages_session ON chat_messages(session_id);
