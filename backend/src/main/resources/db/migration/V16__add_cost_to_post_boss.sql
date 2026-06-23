-- V16__add_cost_to_post_boss.sql
-- Adds the auto-calculated team cost per boss within a post.
--
-- Cost formula (computed server-side from each character slot's character +
-- weapon, never trusted from the client):
--   4★ character (any)        = 0
--   5★ limited character      = cons + 1
--   5★ standard character     = (cons + 1) × 0.5
--   4★ and below weapon (any) = 0
--   5★ limited weapon         = refinement
--   5★ standard weapon        = refinement × 0.5
-- Per-boss cost is the sum of (character cost + weapon cost) across every
-- character slot in that boss. Half-step totals (e.g. 6.5) are expected
-- whenever a standard 5★ character or weapon is involved, hence NUMERIC(4,1)
-- rather than an integer type.
--
-- Existing rows (if any) are backfilled to 0 so the column can be made
-- NOT NULL immediately; the application layer always computes and sets this
-- value itself on create/update — it is never accepted from the client.
ALTER TABLE post_boss
    ADD COLUMN cost NUMERIC(4, 1) NOT NULL DEFAULT 0 CHECK (cost >= 0);

ALTER TABLE post_boss
    ALTER COLUMN cost DROP DEFAULT;

CREATE INDEX idx_postboss_cost ON post_boss(cost);
