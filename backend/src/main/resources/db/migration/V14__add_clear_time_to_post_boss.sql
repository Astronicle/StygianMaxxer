-- V14__add_clear_time_to_post_boss.sql
-- Adds a compulsory clear time (in seconds, 0–120) per boss within a post.
--
-- Existing rows (if any) are backfilled to 0 so the column can be made
-- NOT NULL immediately; the application layer requires an explicit
-- clearTime on every future create/update.
ALTER TABLE post_boss
    ADD COLUMN clear_time SMALLINT NOT NULL DEFAULT 0 CHECK (
        clear_time BETWEEN 0
        AND 120
    );

-- Drop the DEFAULT now that existing/future rows are populated — clear_time
-- should always be supplied explicitly by the application.
ALTER TABLE post_boss
    ALTER COLUMN clear_time DROP DEFAULT;
