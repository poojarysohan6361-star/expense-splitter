-- Expense Splitter schema — draft for review.
-- Design choice: expense_participants stores BOTH the raw split input
-- (raw_value, meaning depends on split_type) and the computed share_amount.
-- This keeps a record of *how* an expense was split, not just the result,
-- so the UI can show it back and the numbers can be recomputed if the
-- splitting algorithm changes later.

CREATE TABLE users (
    id            SERIAL PRIMARY KEY,
    name          VARCHAR(100) NOT NULL,
    email         VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE groups (
    id         SERIAL PRIMARY KEY,
    name       VARCHAR(100) NOT NULL,
    created_by INTEGER NOT NULL REFERENCES users(id),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE group_members (
    group_id  INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id   INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (group_id, user_id)
);

-- split_type constrains how expense_participants.raw_value is interpreted:
--   'equal'      -> raw_value ignored, split evenly among participants
--   'exact'      -> raw_value is the exact amount that participant owes
--   'percentage' -> raw_value is a percentage (0-100) of the total
--   'shares'     -> raw_value is a relative weight (e.g. 1, 2, 3)
CREATE TABLE expenses (
    id          SERIAL PRIMARY KEY,
    group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    paid_by     INTEGER NOT NULL REFERENCES users(id),
    description VARCHAR(255) NOT NULL,
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    split_type  VARCHAR(20) NOT NULL CHECK (split_type IN ('equal', 'exact', 'percentage', 'shares')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE expense_participants (
    id            SERIAL PRIMARY KEY,
    expense_id    INTEGER NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id       INTEGER NOT NULL REFERENCES users(id),
    raw_value     NUMERIC(12, 4),      -- meaning depends on expenses.split_type; null for 'equal'
    share_amount  NUMERIC(12, 2) NOT NULL CHECK (share_amount >= 0),
    UNIQUE (expense_id, user_id)
);

-- Records a settlement between two users in a group (paying off part of a
-- balance). Kept separate from expenses since it's not a shared cost.
CREATE TABLE settlements (
    id          SERIAL PRIMARY KEY,
    group_id    INTEGER NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    from_user   INTEGER NOT NULL REFERENCES users(id),
    to_user     INTEGER NOT NULL REFERENCES users(id),
    amount      NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
    settled_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_expenses_group_id ON expenses(group_id);
CREATE INDEX idx_expense_participants_expense_id ON expense_participants(expense_id);
CREATE INDEX idx_settlements_group_id ON settlements(group_id);
