-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users
CREATE TABLE users (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email         VARCHAR(255) NOT NULL UNIQUE,
    display_name  VARCHAR(100),
    preferences   JSONB,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_users_email ON users (email);

-- Search Queries (analytics)
CREATE TABLE search_queries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    origin         VARCHAR(10),
    destination    VARCHAR(10),
    departure_date DATE,
    return_date    DATE,
    search_type    VARCHAR(20) NOT NULL,
    query_text     VARCHAR(500),
    timestamp      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_sq_user_id  ON search_queries (user_id);
CREATE INDEX idx_sq_timestamp ON search_queries (timestamp DESC);
CREATE INDEX idx_sq_type      ON search_queries (search_type);

-- Saved Items (bookmarks)
CREATE TABLE saved_items (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    external_id VARCHAR(255) NOT NULL,
    item_type   VARCHAR(20) NOT NULL,
    payload     JSONB,
    saved_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_si_user_id   ON saved_items (user_id);
CREATE INDEX idx_si_user_type ON saved_items (user_id, item_type);

-- Itineraries
CREATE TABLE itineraries (
    id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id        UUID REFERENCES users(id) ON DELETE SET NULL,
    destination    VARCHAR(255) NOT NULL,
    duration_days  INTEGER,
    generated_plan JSONB,
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_itin_user_id ON itineraries (user_id);
