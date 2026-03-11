CREATE TYPE subscription_status AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- Подписки пользователей
CREATE TABLE subscriptions (
    id                     BIGSERIAL            PRIMARY KEY,
    user_id                BIGINT               NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan                   user_plan            NOT NULL DEFAULT 'PRO',
    stripe_customer_id     VARCHAR(255),
    stripe_subscription_id VARCHAR(255),
    status                 subscription_status  NOT NULL DEFAULT 'ACTIVE',
    current_period_start   TIMESTAMPTZ,
    current_period_end     TIMESTAMPTZ,
    deleted_at             TIMESTAMPTZ,
    created_at             TIMESTAMPTZ          NOT NULL DEFAULT NOW(),
    updated_at             TIMESTAMPTZ          NOT NULL DEFAULT NOW()
);

CREATE TRIGGER set_subscriptions_updated_at
    BEFORE UPDATE ON subscriptions
    FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();

CREATE UNIQUE INDEX idx_subscriptions_user_active
    ON subscriptions(user_id) WHERE status = 'ACTIVE' AND deleted_at IS NULL;
CREATE INDEX idx_subscriptions_stripe ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_deleted ON subscriptions(deleted_at) WHERE deleted_at IS NULL;

-- История платежей
CREATE TABLE payment_history (
    id               BIGSERIAL       PRIMARY KEY,
    user_id          BIGINT          NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount_cents     INTEGER         NOT NULL,
    currency         VARCHAR(3)      NOT NULL DEFAULT 'KZT',
    stripe_payment_id VARCHAR(255),
    status           VARCHAR(50)     NOT NULL,    -- succeeded, failed, refunded
    description      VARCHAR(255),
    created_at       TIMESTAMPTZ     NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_payment_history_user ON payment_history(user_id);
