-- V9__add_weapon_and_artifact_set.sql
-- Adds weapon and artifact_set lookup tables, and makes every post_boss_character
-- row carry a compulsory weapon + artifact set selection.
-- Data for these two tables is seeded in V10 (weapons) and V11 (artifact sets).

-- Static Lookup Tables
CREATE TABLE weapon (
    weapon_id SMALLINT PRIMARY KEY,
    weapon_slug TEXT NOT NULL UNIQUE,
    weapon_name TEXT NOT NULL UNIQUE,
    rarity SMALLINT NOT NULL CHECK (
        rarity BETWEEN 1
        AND 5
    ),
    wep_type_id SMALLINT NOT NULL,
    CONSTRAINT fk_weapon_weptype FOREIGN KEY (wep_type_id) REFERENCES wep_type(wep_type_id)
);

CREATE INDEX idx_weapon_weptype ON weapon(wep_type_id);

CREATE TABLE artifact_set (
    artifact_set_id SMALLINT PRIMARY KEY,
    artifact_set_slug TEXT NOT NULL UNIQUE,
    artifact_set_name TEXT NOT NULL UNIQUE
);

-- post_boss_character: every character loadout must compulsorily carry
-- a weapon (matching the character's weapon type, enforced in the service layer)
-- and an artifact set.
ALTER TABLE post_boss_character
    ADD COLUMN weapon_id SMALLINT,
    ADD COLUMN artifact_set_id SMALLINT;

ALTER TABLE post_boss_character
    ADD CONSTRAINT fk_pbc_weapon FOREIGN KEY (weapon_id) REFERENCES weapon(weapon_id),
    ADD CONSTRAINT fk_pbc_artifactset FOREIGN KEY (artifact_set_id) REFERENCES artifact_set(artifact_set_id);

-- NOTE: columns are added nullable first because weapon/artifact_set rows do not
-- exist yet at this point in the migration chain (they're seeded in V10/V11).
-- They are tightened to NOT NULL in V12, once seed data is present and any
-- pre-existing post_boss_character rows have been backfilled.

CREATE INDEX idx_pbc_weapon ON post_boss_character(weapon_id);

CREATE INDEX idx_pbc_artifactset ON post_boss_character(artifact_set_id);
