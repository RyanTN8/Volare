-- Composite indexes for queries that filter by user and sort by time.
-- Replaces the single-column indexes with covering indexes to avoid in-memory sorts.

CREATE INDEX idx_si_user_saved_at    ON saved_items    (user_id, saved_at   DESC);
CREATE INDEX idx_itin_user_created   ON itineraries    (user_id, created_at DESC);
CREATE INDEX idx_sq_user_timestamp   ON search_queries (user_id, timestamp  DESC);
