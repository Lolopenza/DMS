-- История вычислений калькулятора (для авторизованных пользователей)
CREATE TABLE calc_history (
    id          BIGSERIAL       PRIMARY KEY,
    user_id     BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section     VARCHAR(50)     NOT NULL,    -- combinatorics, graph_theory, logic, ...
    operation   VARCHAR(100)    NOT NULL,
    input_data  JSONB           NOT NULL,
    output_data JSONB,
    created_at  TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_calc_history_user ON calc_history(user_id);
CREATE INDEX idx_calc_history_created ON calc_history(created_at DESC);
