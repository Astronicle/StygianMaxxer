-- V15__add_is_limited_to_character_and_weapon.sql
-- Adds the "limited vs standard" banner classification needed for the team
-- cost formula:
--   5★ limited character  = cons + 1
--   5★ standard character = (cons + 1) × 0.5
--   5★ limited weapon     = refinement
--   5★ standard weapon    = refinement × 0.5
--   4★ and below (either) = 0, regardless of is_limited
--
-- is_limited only matters for 5★ rows — it's stored on every row for
-- simplicity, but 4★ rows are never read by the cost calculation since
-- rarity alone forces their cost to 0.
--
-- Default is TRUE (limited) since limited is the larger group; the
-- permanent-banner ("standard") characters/weapons below are then flipped
-- to FALSE explicitly. This list is exhaustive as of the time of writing —
-- it will need updating if Standard Wish / Stygian-exclusive availability
-- ever changes.
ALTER TABLE character
    ADD COLUMN is_limited BOOLEAN NOT NULL DEFAULT true;

ALTER TABLE weapon
    ADD COLUMN is_limited BOOLEAN NOT NULL DEFAULT true;

-- Standard Wish (permanent banner) 5★ characters
UPDATE character
SET is_limited = false
WHERE char_slug IN (
    'dehya',
    'diluc',
    'jean',
    'keqing',
    'mona',
    'qiqi',
    'tighnari',
    'mizuki'
);

-- Standard Wish (permanent banner) 5★ weapons
UPDATE weapon
SET is_limited = false
WHERE weapon_slug IN (
    'amos-bow',
    'aquila-favonia',
    'lost-prayer-to-the-sacred-winds',
    'primordial-jade-winged-spear',
    'skyward-atlas',
    'skyward-blade',
    'skyward-harp',
    'skyward-pride',
    'skyward-spine',
    'wolfs-gravestone'
);
