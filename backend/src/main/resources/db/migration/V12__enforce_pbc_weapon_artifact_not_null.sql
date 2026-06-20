-- V12__enforce_pbc_weapon_artifact_not_null.sql
-- Makes weapon_id and artifact_set_id compulsory on post_boss_character.
--
-- Any pre-existing post_boss_character rows (created before this feature existed)
-- won't have a weapon/artifact set yet. Since there is no sensible default,
-- they are backfilled to a placeholder so the NOT NULL constraint can be applied;
-- the application layer requires both fields on every future create/update.
UPDATE post_boss_character pbc
SET weapon_id = (
    SELECT w.weapon_id
    FROM weapon w
    JOIN character c ON c.wep_type_id = w.wep_type_id
    WHERE c.char_id = pbc.char_id
    ORDER BY w.weapon_id
    LIMIT 1
)
WHERE pbc.weapon_id IS NULL;

UPDATE post_boss_character
SET artifact_set_id = (SELECT MIN(artifact_set_id) FROM artifact_set)
WHERE artifact_set_id IS NULL;

ALTER TABLE post_boss_character
    ALTER COLUMN weapon_id SET NOT NULL,
    ALTER COLUMN artifact_set_id SET NOT NULL;
