-- V13__add_refinement_to_post_boss_character.sql
-- Adds a compulsory weapon refinement level (R1–R5) to post_boss_character.
--
-- Default convention (enforced client-side, not by this constraint):
--   4★ and below weapons default to R5, 5★ weapons default to R1.
-- The CHECK constraint here only guarantees the value is a valid refinement
-- level (1-5) — it does not know or care about weapon rarity.
--
-- Existing rows (if any) are backfilled to R1 so the column can be made
-- NOT NULL immediately; the application layer requires an explicit
-- refinement on every future create/update.
ALTER TABLE post_boss_character
    ADD COLUMN refinement SMALLINT NOT NULL DEFAULT 1 CHECK (
        refinement BETWEEN 1
        AND 5
    );

-- Drop the DEFAULT now that existing/future rows are populated — refinement
-- should always be supplied explicitly by the application, same as
-- weapon_id/artifact_set_id.
ALTER TABLE post_boss_character
    ALTER COLUMN refinement DROP DEFAULT;
