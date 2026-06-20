-- V8__add_difficulty_to_post.sql
-- Adds a difficulty column to the post table with an enum constraint.
-- Allowed values: 'Fearless', 'Dire'

CREATE TYPE difficulty_enum AS ENUM ('Fearless', 'Dire');

ALTER TABLE post
    ADD COLUMN difficulty difficulty_enum NOT NULL DEFAULT 'Fearless';

-- Remove the default after backfill so future inserts must supply an explicit value.
ALTER TABLE post ALTER COLUMN difficulty DROP DEFAULT;
